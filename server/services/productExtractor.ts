import * as cheerio from 'cheerio';

export interface ExtractedProduct {
  title: string;
  price: string;
  imageUrl?: string;
  storeDomain: string;
  color?: string;
  size?: string;
  availability?: string;
}

export interface ExtractionResult {
  success: boolean;
  product?: ExtractedProduct;
  error?: string;
}

export class ProductExtractor {
  private static SUPPORTED_DOMAINS = [
    'amazon.in',
    'amazon.com',
    'flipkart.com',
    'myntra.com',
    'nykaa.com',
    'ajio.com',
    'meesho.com',
    'shopclues.com',
    'snapdeal.com',
    'ebay.com'
  ];

  private static USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  // Approximate USD to INR conversion rate (should be updated regularly)
  private static USD_TO_INR_RATE = 83.0;

  private static convertUsdToInr(usdPrice: string): string {
    const numericPrice = parseFloat(usdPrice.replace(/[^\d.]/g, ''));
    if (isNaN(numericPrice)) return usdPrice;
    const inrPrice = numericPrice * this.USD_TO_INR_RATE;
    return `₹${inrPrice.toFixed(2)}`;
  }

  static async extractFromUrl(url: string): Promise<ExtractionResult> {
    try {
      // Validate URL
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.replace('www.', '');
      
      if (!this.SUPPORTED_DOMAINS.some(supportedDomain => domain.includes(supportedDomain))) {
        return {
          success: false,
          error: `Unsupported domain: ${domain}. Supported sites: ${this.SUPPORTED_DOMAINS.join(', ')}`
        };
      }

      // Try multiple extraction strategies for anti-bot protection
      let response: Response;
      
      // Strategy 1: Basic fetch with realistic headers
      try {
        response = await fetch(url, {
          headers: {
            'User-Agent': this.USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'Cache-Control': 'max-age=0',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
            'Connection': 'keep-alive',
          }
        });
      } catch (error) {
        return {
          success: false,
          error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      // If blocked, try alternative approach
      if (response.status === 403 || response.status === 429) {
        console.log(`Initial request blocked (${response.status}), trying alternative headers`);
        
        try {
          // Strategy 2: Minimal headers to appear less bot-like
          response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
            }
          });
        } catch (error) {
          return {
            success: false,
            error: `Alternative fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          };
        }
      }

      // Still blocked after all attempts
      if (!response.ok) {
        if (response.status === 403) {
          return {
            success: false,
            error: `Access blocked by ${domain}. This site has anti-bot protection. Please try:\n1. Copy the product title and price manually\n2. Use the manual entry option\n3. Try a different product URL from the same site`
          };
        } else if (response.status === 429) {
          return {
            success: false,
            error: `Rate limited by ${domain}. Please wait a few minutes and try again.`
          };
        } else {
          return {
            success: false,
            error: `Failed to fetch page: ${response.status} ${response.statusText}`
          };
        }
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract based on domain
      let result: ExtractionResult;
      
      if (domain.includes('amazon.in') || domain.includes('amazon.com')) {
        result = this.extractFromAmazon($, domain);
      } else if (domain.includes('ebay.com')) {
        result = this.extractFromEbay($, domain);
      } else if (domain.includes('flipkart.com')) {
        result = this.extractFromFlipkart($, domain);
      } else if (domain.includes('myntra.com')) {
        result = this.extractFromMyntra($, domain);
      } else if (domain.includes('nykaa.com')) {
        result = this.extractFromNykaa($, domain);
      } else if (domain.includes('ajio.com')) {
        result = this.extractFromAjio($, domain);
      } else if (domain.includes('meesho.com')) {
        result = this.extractFromMeesho($, domain);
      } else if (domain.includes('shopclues.com')) {
        result = this.extractFromShopclues($, domain);
      } else if (domain.includes('snapdeal.com')) {
        result = this.extractFromSnapdeal($, domain);
      } else {
        return {
          success: false,
          error: 'No extraction method found for this domain'
        };
      }

      // If specific extraction failed, try generic fallback
      if (!result.success) {
        console.log(`Specific extraction failed for ${domain}, trying generic fallback`);
        result = this.extractGeneric($, domain);
      }

      return result;

    } catch (error) {
      return {
        success: false,
        error: `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromAmazon($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      const title = $('#productTitle').text().trim() || 
                   $('h1.a-size-large').text().trim() ||
                   $('[data-feature-name="title"] h1').text().trim();

      const price = $('.a-price-whole').first().text().trim() ||
                   $('.a-price .a-offscreen').first().text().trim() ||
                   $('#priceblock_dealprice').text().trim() ||
                   $('#priceblock_ourprice').text().trim();

      const imageUrl = $('#landingImage').attr('src') ||
                      $('.a-dynamic-image').first().attr('src') ||
                      $('#imgTagWrapperId img').attr('src');

      const availability = $('#availability span').text().trim() ||
                          $('.a-color-state').text().trim();

      // Try to extract color and size from variation selectors
      const color = $('#variation_color_name .selection').text().trim() ||
                   $('.swatches-container .swatch.selected').attr('title');

      const size = $('#variation_size_name .selection').text().trim() ||
                  $('.size-selections .selected').text().trim();

      if (!title || !price) {
        return {
          success: false,
          error: 'Could not extract required product information from Amazon page'
        };
      }

      // Determine store name and handle currency conversion
      const isAmazonUS = domain === 'amazon.com';
      const storeName = isAmazonUS ? 'Amazon US' : 'Amazon India';
      
      // Convert USD to INR for Amazon US
      let processedPrice = price.replace(/[^\d.,]/g, '');
      if (isAmazonUS && price.includes('$')) {
        processedPrice = this.convertUsdToInr(price);
      } else if (!price.includes('₹') && !price.includes('$')) {
        // If no currency symbol, assume INR for amazon.in and USD for amazon.com
        processedPrice = isAmazonUS ? this.convertUsdToInr(price) : `₹${processedPrice}`;
      }

      return {
        success: true,
        product: {
          title,
          price: processedPrice,
          imageUrl,
          storeDomain: storeName,
          color,
          size,
          availability
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Amazon extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromFlipkart($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      // Updated selectors for Flipkart's current structure
      const title = $('h1 span').text().trim() ||
                   $('.B_NuCI').text().trim() ||
                   $('._35KyD6').text().trim() ||
                   $('h1[class*="title"]').text().trim() ||
                   $('span[class*="title"]').text().trim() ||
                   $('h1').first().text().trim();

      const price = $('._30jeq3._16Jk6d').text().trim() ||
                   $('._30jeq3').text().trim() ||
                   $('._1_WHN1').text().trim() ||
                   $('div[class*="price"] span').first().text().trim() ||
                   $('span[class*="price"]').first().text().trim();

      const imageUrl = $('._396cs4 img').attr('src') ||
                      $('._2r_T1I img').attr('src') ||
                      $('._3li7GG img').attr('src') ||
                      $('img[class*="product"]').first().attr('src') ||
                      $('img[alt*="product"]').first().attr('src');

      const availability = $('._16FRp0').text().trim() ||
                          $('._3xgqrA').text().trim() ||
                          $('div[class*="stock"]').text().trim();

      // Extract color and size information
      const color = $('div[class*="color"] span').text().trim() ||
                   $('.selected-color').text().trim();

      const size = $('div[class*="size"] span').text().trim() ||
                  $('.selected-size').text().trim();

      if (!title || !price) {
        // Debug information
        console.log('Flipkart extraction debug:', {
          titleSelectors: {
            'h1 span': $('h1 span').length,
            '.B_NuCI': $('.B_NuCI').length,
            'h1': $('h1').length
          },
          priceSelectors: {
            '._30jeq3._16Jk6d': $('._30jeq3._16Jk6d').length,
            '._30jeq3': $('._30jeq3').length,
            'span[class*="price"]': $('span[class*="price"]').length
          }
        });
        
        return {
          success: false,
          error: 'Could not extract required product information from Flipkart page. The page structure may have changed.'
        };
      }

      return {
        success: true,
        product: {
          title,
          price: price.replace(/[^\d.,]/g, ''),
          imageUrl,
          storeDomain: domain,
          color,
          size,
          availability
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Flipkart extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromMyntra($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      // Updated selectors for Myntra's current structure
      const title = $('h1.pdp-title').text().trim() ||
                   $('.pdp-name').text().trim() ||
                   $('h1[class*="title"]').text().trim() ||
                   $('h1').first().text().trim();

      const price = $('.pdp-price strong').text().trim() ||
                   $('.price-current').text().trim() ||
                   $('span[class*="price"]').first().text().trim() ||
                   $('div[class*="price"] span').first().text().trim();

      const imageUrl = $('.image-grid-image').first().attr('src') ||
                      $('.pdp-img').attr('src') ||
                      $('img[class*="image"]').first().attr('src') ||
                      $('img[alt*="product"]').first().attr('src');

      // More flexible color and size extraction
      const color = $('span[class*="color"]').text().trim() ||
                   $('.selected-color').text().trim();

      const size = $('span[class*="size"]').text().trim() ||
                  $('.selected-size').text().trim();

      if (!title || !price) {
        // Debug information
        console.log('Myntra extraction debug:', {
          titleSelectors: {
            'h1.pdp-title': $('h1.pdp-title').length,
            '.pdp-name': $('.pdp-name').length,
            'h1': $('h1').length
          },
          priceSelectors: {
            '.pdp-price strong': $('.pdp-price strong').length,
            '.price-current': $('.price-current').length,
            'span[class*="price"]': $('span[class*="price"]').length
          }
        });
        
        return {
          success: false,
          error: 'Could not extract required product information from Myntra page. The page structure may have changed.'
        };
      }

      return {
        success: true,
        product: {
          title,
          price: price.replace(/[^\d.,]/g, ''),
          imageUrl,
          storeDomain: domain,
          color,
          size
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Myntra extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromNykaa($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      // Updated selectors for Nykaa's current structure
      const title = $('h1[data-testid="pdp_product_name"]').text().trim() ||
                   $('.product-title').text().trim() ||
                   $('h1[class*="product"]').text().trim() ||
                   $('h1[class*="title"]').text().trim() ||
                   $('h1').first().text().trim();

      const price = $('[data-testid="pdp_product_price"]').text().trim() ||
                   $('.price').text().trim() ||
                   $('span[class*="price"]').first().text().trim() ||
                   $('div[class*="price"] span').first().text().trim();

      const imageUrl = $('[data-testid="pdp_product_image"] img').attr('src') ||
                      $('.product-image img').attr('src') ||
                      $('img[class*="product"]').first().attr('src') ||
                      $('img[alt*="product"]').first().attr('src');

      // Extract color and size information
      const color = $('span[class*="color"]').text().trim() ||
                   $('div[class*="shade"]').text().trim() ||
                   $('.selected-color').text().trim();

      const size = $('span[class*="size"]').text().trim() ||
                  $('.selected-size').text().trim();

      if (!title || !price) {
        // Debug information
        console.log('Nykaa extraction debug:', {
          titleSelectors: {
            'h1[data-testid="pdp_product_name"]': $('h1[data-testid="pdp_product_name"]').length,
            '.product-title': $('.product-title').length,
            'h1': $('h1').length
          },
          priceSelectors: {
            '[data-testid="pdp_product_price"]': $('[data-testid="pdp_product_price"]').length,
            '.price': $('.price').length,
            'span[class*="price"]': $('span[class*="price"]').length
          }
        });
        
        return {
          success: false,
          error: 'Could not extract required product information from Nykaa page. The page structure may have changed.'
        };
      }

      return {
        success: true,
        product: {
          title,
          price: price.replace(/[^\d.,]/g, ''),
          imageUrl,
          storeDomain: domain,
          color,
          size
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Nykaa extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromAjio($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      // Updated selectors for Ajio's current structure
      const title = $('h1.pdp-product-name').text().trim() ||
                   $('.product-name').text().trim() ||
                   $('h1[class*="product"]').text().trim() ||
                   $('h1[class*="title"]').text().trim() ||
                   $('h1').first().text().trim();

      const price = $('.pdp-price .price-value').text().trim() ||
                   $('.current-price').text().trim() ||
                   $('span[class*="price"]').first().text().trim() ||
                   $('.price').first().text().trim() ||
                   $('div[class*="price"] span').first().text().trim();

      const imageUrl = $('.pdp-image img').attr('src') ||
                      $('.product-image img').attr('src') ||
                      $('img[class*="product"]').first().attr('src') ||
                      $('img[alt*="product"]').first().attr('src');

      // Extract color and size information
      const color = $('span[class*="color"]').text().trim() ||
                   $('.selected-color').text().trim();

      const size = $('span[class*="size"]').text().trim() ||
                  $('.selected-size').text().trim();

      if (!title || !price) {
        // Debug information
        console.log('Ajio extraction debug:', {
          titleSelectors: {
            'h1.pdp-product-name': $('h1.pdp-product-name').length,
            '.product-name': $('.product-name').length,
            'h1': $('h1').length
          },
          priceSelectors: {
            '.pdp-price .price-value': $('.pdp-price .price-value').length,
            '.current-price': $('.current-price').length,
            'span[class*="price"]': $('span[class*="price"]').length
          }
        });
        
        return {
          success: false,
          error: 'Could not extract required product information from Ajio page. The page structure may have changed.'
        };
      }

      return {
        success: true,
        product: {
          title,
          price: price.replace(/[^\d.,]/g, ''),
          imageUrl,
          storeDomain: domain,
          color,
          size
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Ajio extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromMeesho($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      // Updated selectors for Meesho's current structure
      const title = $('h1[class*="product"]').text().trim() ||
                   $('.product-title').text().trim() ||
                   $('h1[class*="title"]').text().trim() ||
                   $('h1').first().text().trim();

      const price = $('span[class*="price"]').first().text().trim() ||
                   $('.price').first().text().trim() ||
                   $('div[class*="price"] span').first().text().trim() ||
                   $('span[class*="rs"]').first().text().trim();

      const imageUrl = $('img[class*="product"]').first().attr('src') ||
                      $('.product-image img').first().attr('src') ||
                      $('img[alt*="product"]').first().attr('src') ||
                      $('img').first().attr('src');

      // Extract additional information
      const availability = $('span[class*="stock"]').text().trim() ||
                          $('div[class*="available"]').text().trim();

      if (!title || !price) {
        console.log('Meesho extraction debug:', {
          titleSelectors: {
            'h1[class*="product"]': $('h1[class*="product"]').length,
            '.product-title': $('.product-title').length,
            'h1': $('h1').length
          },
          priceSelectors: {
            'span[class*="price"]': $('span[class*="price"]').length,
            '.price': $('.price').length
          }
        });
        
        return {
          success: false,
          error: 'Could not extract required product information from Meesho page. The page structure may have changed.'
        };
      }

      return {
        success: true,
        product: {
          title,
          price: price.replace(/[^\d.,]/g, ''),
          imageUrl,
          storeDomain: domain,
          availability
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Meesho extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromShopclues($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      // Updated selectors for Shopclues's current structure
      const title = $('h1.prd_name').text().trim() ||
                   $('.product-title').text().trim() ||
                   $('h1[class*="product"]').text().trim() ||
                   $('h1').first().text().trim();

      const price = $('.prd_price').text().trim() ||
                   $('.price').first().text().trim() ||
                   $('span[class*="price"]').first().text().trim() ||
                   $('div[class*="price"] span').first().text().trim();

      const imageUrl = $('.prd_img img').attr('src') ||
                      $('.product-image img').first().attr('src') ||
                      $('img[class*="product"]').first().attr('src') ||
                      $('img[alt*="product"]').first().attr('src');

      // Extract additional information
      const availability = $('span[class*="stock"]').text().trim() ||
                          $('.availability').text().trim();

      if (!title || !price) {
        console.log('Shopclues extraction debug:', {
          titleSelectors: {
            'h1.prd_name': $('h1.prd_name').length,
            '.product-title': $('.product-title').length,
            'h1': $('h1').length
          },
          priceSelectors: {
            '.prd_price': $('.prd_price').length,
            '.price': $('.price').length,
            'span[class*="price"]': $('span[class*="price"]').length
          }
        });
        
        return {
          success: false,
          error: 'Could not extract required product information from Shopclues page. The page structure may have changed.'
        };
      }

      return {
        success: true,
        product: {
          title,
          price: price.replace(/[^\d.,]/g, ''),
          imageUrl,
          storeDomain: domain,
          availability
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Shopclues extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromSnapdeal($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      // Updated selectors for Snapdeal's current structure
      const title = $('h1[itemprop="name"]').text().trim() ||
                   $('.pdp-product-name').text().trim() ||
                   $('h1[class*="product"]').text().trim() ||
                   $('h1').first().text().trim();

      const price = $('span[itemprop="price"]').text().trim() ||
                   $('.payBlkBig').text().trim() ||
                   $('.price').first().text().trim() ||
                   $('span[class*="price"]').first().text().trim();

      const imageUrl = $('img[itemprop="image"]').attr('src') ||
                      $('.cloudzoom').attr('src') ||
                      $('.product-image img').first().attr('src') ||
                      $('img[class*="product"]').first().attr('src');

      // Extract additional information
      const availability = $('div[class*="stock"]').text().trim() ||
                          $('.availability-status').text().trim();

      if (!title || !price) {
        console.log('Snapdeal extraction debug:', {
          titleSelectors: {
            'h1[itemprop="name"]': $('h1[itemprop="name"]').length,
            '.pdp-product-name': $('.pdp-product-name').length,
            'h1': $('h1').length
          },
          priceSelectors: {
            'span[itemprop="price"]': $('span[itemprop="price"]').length,
            '.payBlkBig': $('.payBlkBig').length,
            'span[class*="price"]': $('span[class*="price"]').length
          }
        });
        
        return {
          success: false,
          error: 'Could not extract required product information from Snapdeal page. The page structure may have changed.'
        };
      }

      return {
        success: true,
        product: {
          title,
          price: price.replace(/[^\d.,]/g, ''),
          imageUrl,
          storeDomain: domain,
          availability
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Snapdeal extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromEbay($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      // Updated selectors for eBay's current structure
      const title = $('h1[data-testid="x-item-title-label"]').text().trim() ||
                   $('.x-item-title-label').text().trim() ||
                   $('#iti-title').text().trim() ||
                   $('h1[class*="notranslate"]').text().trim() ||
                   $('h1').first().text().trim();

      const price = $('[data-testid="notranslate"]').first().text().trim() ||
                   $('.display-price').text().trim() ||
                   $('[class*="price"]').first().text().trim() ||
                   $('.u-flL.condText').text().trim() ||
                   $('#prcIsum').text().trim();

      const imageUrl = $('#icImg').attr('src') ||
                      $('[data-testid="ux-image-carousel-item"] img').first().attr('src') ||
                      $('.ux-image-carousel-item img').first().attr('src') ||
                      $('img[alt*="Picture"]').first().attr('src') ||
                      $('img').first().attr('src');

      // Extract additional information
      const availability = $('[data-testid="u-bold"]').text().trim() ||
                          $('.u-flL.condText').text().trim() ||
                          $('[class*="available"]').text().trim();

      if (!title || !price) {
        console.log('eBay extraction debug:', {
          titleSelectors: {
            'h1[data-testid="x-item-title-label"]': $('h1[data-testid="x-item-title-label"]').length,
            '.x-item-title-label': $('.x-item-title-label').length,
            '#iti-title': $('#iti-title').length,
            'h1': $('h1').length
          },
          priceSelectors: {
            '[data-testid="notranslate"]': $('[data-testid="notranslate"]').length,
            '.display-price': $('.display-price').length,
            '[class*="price"]': $('[class*="price"]').length,
            '#prcIsum': $('#prcIsum').length
          }
        });
        
        return {
          success: false,
          error: 'Could not extract required product information from eBay page. The page structure may have changed.'
        };
      }

      // Convert USD to INR for eBay (assumes USD pricing)
      let processedPrice = price.replace(/[^\d.,]/g, '');
      if (price.includes('$') || !price.includes('₹')) {
        processedPrice = this.convertUsdToInr(price);
      }

      return {
        success: true,
        product: {
          title,
          price: processedPrice,
          imageUrl,
          storeDomain: 'eBay',
          availability
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `eBay extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Generic fallback extraction method
  private static extractGeneric($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      console.log(`Attempting generic extraction for ${domain}`);
      
      // Try various common selectors for title
      const titleSelectors = [
        'h1',
        '[data-testid*="title"]',
        '[data-testid*="name"]',
        '.product-title',
        '.pdp-title',
        '.product-name',
        '[class*="title"]',
        '[class*="name"]',
        '[class*="product-title"]'
      ];

      let title = '';
      for (const selector of titleSelectors) {
        title = $(selector).first().text().trim();
        if (title && title.length > 5) break;
      }

      // Try various common selectors for price
      const priceSelectors = [
        '[data-testid*="price"]',
        '.price',
        '.product-price',
        '.current-price',
        '[class*="price"]',
        '[class*="current"]',
        'span[class*="rs"]',
        'span[class*="rupee"]',
        'span[class*="₹"]'
      ];

      let price = '';
      for (const selector of priceSelectors) {
        const priceText = $(selector).first().text().trim();
        if (priceText && /[₹\d,.]/.test(priceText)) {
          price = priceText;
          break;
        }
      }

      // Try to find product images
      const imageSelectors = [
        'img[alt*="product"]',
        'img[class*="product"]',
        'img[data-testid*="image"]',
        '.product-image img',
        '.pdp-image img',
        'main img',
        'img[src*="product"]'
      ];

      let imageUrl = '';
      for (const selector of imageSelectors) {
        const src = $(selector).first().attr('src');
        if (src && (src.startsWith('http') || src.startsWith('//'))) {
          imageUrl = src;
          break;
        }
      }

      console.log('Generic extraction results:', {
        title: title ? 'Found' : 'Not found',
        price: price ? 'Found' : 'Not found',
        image: imageUrl ? 'Found' : 'Not found'
      });

      if (!title || !price) {
        return {
          success: false,
          error: `Generic extraction failed - Could not find ${!title ? 'title' : ''} ${!title && !price ? 'and' : ''} ${!price ? 'price' : ''} on the page`
        };
      }

      return {
        success: true,
        product: {
          title,
          price: price.replace(/[^\d.,]/g, ''),
          imageUrl,
          storeDomain: domain
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Generic extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
