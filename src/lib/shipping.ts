import { supabase } from "@/integrations/supabase/client";

export interface ShippingCity {
  id: string;
  city_name: string;
  shipping_price: number;
  is_active: boolean;
}

export const getShippingCities = async (): Promise<ShippingCity[]> => {
  try {
    const { data, error } = await supabase
      .from("shipping_cities")
      .select("*")
      .eq("is_active", true)
      .order("city_name");

    if (error) {
      console.error("Error fetching shipping cities:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching shipping cities:", error);
    return [];
  }
};

export const getShippingCostForCity = async (cityId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from("shipping_cities")
      .select("shipping_price")
      .eq("id", cityId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching shipping cost:", error);
      return 0;
    }

    return data?.shipping_price || 0;
  } catch (error) {
    console.error("Error fetching shipping cost:", error);
    return 0;
  }
};

export const getCityNameById = async (cityId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from("shipping_cities")
      .select("city_name")
      .eq("id", cityId)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching city name:", error);
      return "";
    }

    return data?.city_name || "";
  } catch (error) {
    console.error("Error fetching city name:", error);
    return "";
  }
};