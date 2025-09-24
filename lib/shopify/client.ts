import axios, { AxiosInstance } from 'axios';

export interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  variants: Array<{
    id: string;
    price: string;
    compare_at_price?: string;
    inventory_quantity: number;
  }>;
  images: Array<{
    id: string;
    src: string;
    alt?: string;
  }>;
}

export class ShopifyClient {
  private client: AxiosInstance;

  constructor(shopUrl: string, accessToken: string) {
    this.client = axios.create({
      baseURL: `https://${shopUrl}/admin/api/2024-01`,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  async getProducts(limit = 50, page_info?: string): Promise<{
    products: ShopifyProduct[];
    pageInfo?: string;
  }> {
    try {
      const params: any = { limit };
      if (page_info) {
        params.page_info = page_info;
      }

      const response = await this.client.get('/products.json', { params });
      
      // Extract page info from Link header
      const linkHeader = response.headers.link;
      let nextPageInfo: string | undefined;
      
      if (linkHeader) {
        const matches = linkHeader.match(/page_info=([^>]+)>; rel="next"/);
        if (matches) {
          nextPageInfo = matches[1];
        }
      }

      return {
        products: response.data.products,
        pageInfo: nextPageInfo,
      };
    } catch (error: any) {
      console.error('Shopify API error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch products: ${error.response?.data?.errors || error.message}`);
    }
  }

  async getProduct(productId: string): Promise<ShopifyProduct> {
    try {
      const response = await this.client.get(`/products/${productId}.json`);
      return response.data.product;
    } catch (error: any) {
      console.error('Shopify API error:', error.response?.data || error.message);
      throw new Error(`Failed to fetch product: ${error.response?.data?.errors || error.message}`);
    }
  }

  async validateCredentials(): Promise<boolean> {
    try {
      await this.client.get('/shop.json');
      return true;
    } catch {
      return false;
    }
  }
}
