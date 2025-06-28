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
    'flipkart.com',
    'myntra.com',
    'nykaa.com',
    'ajio.com'
  ];

  private static USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

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

      // Fetch page content
      const response = await fetch(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Failed to fetch page: ${response.status} ${response.statusText}`
        };
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Extract based on domain
      if (domain.includes('amazon.in')) {
        return this.extractFromAmazon($, domain);
      } else if (domain.includes('flipkart.com')) {
        return this.extractFromFlipkart($, domain);
      } else if (domain.includes('myntra.com')) {
        return this.extractFromMyntra($, domain);
      } else if (domain.includes('nykaa.com')) {
        return this.extractFromNykaa($, domain);
      } else if (domain.includes('ajio.com')) {
        return this.extractFromAjio($, domain);
      }

      return {
        success: false,
        error: 'No extraction method found for this domain'
      };

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
        error: `Amazon extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromFlipkart($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      const title = $('h1 span').text().trim() ||
                   $('.B_NuCI').text().trim() ||
                   $('._35KyD6').text().trim();

      const price = $('._30jeq3._16Jk6d').text().trim() ||
                   $('._30jeq3').text().trim() ||
                   $('._1_WHN1').text().trim();

      const imageUrl = $('._396cs4 img').attr('src') ||
                      $('._2r_T1I img').attr('src') ||
                      $('._3li7GG img').attr('src');

      const availability = $('._16FRp0').text().trim() ||
                          $('._3xgqrA').text().trim();

      if (!title || !price) {
        return {
          success: false,
          error: 'Could not extract required product information from Flipkart page'
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
        error: `Flipkart extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromMyntra($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      const title = $('.pdp-name').text().trim() ||
                   $('h1.pdp-title').text().trim();

      const price = $('.pdp-price strong').text().trim() ||
                   $('.price-current').text().trim();

      const imageUrl = $('.image-grid-image').first().attr('src') ||
                      $('.pdp-img').attr('src');

      if (!title || !price) {
        return {
          success: false,
          error: 'Could not extract required product information from Myntra page'
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
        error: `Myntra extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromNykaa($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      const title = $('h1[data-testid="pdp_product_name"]').text().trim() ||
                   $('.product-title').text().trim();

      const price = $('[data-testid="pdp_product_price"]').text().trim() ||
                   $('.price').text().trim();

      const imageUrl = $('[data-testid="pdp_product_image"] img').attr('src') ||
                      $('.product-image img').attr('src');

      if (!title || !price) {
        return {
          success: false,
          error: 'Could not extract required product information from Nykaa page'
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
        error: `Nykaa extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static extractFromAjio($: cheerio.CheerioAPI, domain: string): ExtractionResult {
    try {
      const title = $('h1.pdp-product-name').text().trim() ||
                   $('.product-name').text().trim();

      const price = $('.pdp-price .price-value').text().trim() ||
                   $('.current-price').text().trim();

      const imageUrl = $('.pdp-image img').attr('src') ||
                      $('.product-image img').attr('src');

      if (!title || !price) {
        return {
          success: false,
          error: 'Could not extract required product information from Ajio page'
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
        error: `Ajio extraction error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}
