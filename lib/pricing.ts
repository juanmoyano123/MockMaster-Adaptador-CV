/**
 * Dynamic Pricing
 *
 * Reads / writes the Pro plan price from app_config in Supabase.
 * Falls back to PLANS.pro.price if the table row doesn't exist.
 */

import { createClient } from '@supabase/supabase-js';
import { PLANS } from './subscription-config';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase service role credentials');
  return createClient(url, key);
}

export async function getProPrice(): Promise<number> {
  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'pro_price')
      .single();

    if (data?.value) {
      const parsed = parseFloat(data.value);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {
    // fall through to default
  }
  return PLANS.pro.price;
}

export async function setProPrice(price: number): Promise<void> {
  const supabase = getServiceClient();
  await supabase.from('app_config').upsert({
    key: 'pro_price',
    value: String(price),
    updated_at: new Date().toISOString(),
  });
}
