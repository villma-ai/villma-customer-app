import { NextRequest } from 'next/server';

type ShopifyProductEdge = {
  node: {
    id: string;
    title: string;
  };
};

type ShopifyProductsResponse = {
  data?: {
    products?: {
      edges?: ShopifyProductEdge[];
    };
  };
};

export async function POST(req: NextRequest) {
  const { shopDomain, adminApiToken, search } = await req.json();

  if (!shopDomain || !adminApiToken || !search) {
    return new Response(JSON.stringify({ error: 'Missing required parameters' }), { status: 400 });
  }

  const query = `
    {
      products(first: 10, query: "title:*${search}*") {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(shopDomain, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminApiToken
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), { status: response.status });
    }

    const data: ShopifyProductsResponse = await response.json();

    const products =
      data.data?.products?.edges?.map((edge) => ({
        id: edge.node.id,
        title: edge.node.title
      })) || [];

    return new Response(JSON.stringify({ products }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch products from Shopify' }), {
      status: 500
    });
  }
}
