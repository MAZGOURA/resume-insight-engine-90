-- Fix security warnings: Add search_path to all functions

-- Fix set_order_number
CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number = 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::text, 1, 8);
    END IF;
    RETURN NEW;
END;
$function$;

-- Fix set_invoice_number
CREATE OR REPLACE FUNCTION public.set_invoice_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number = 'INV' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::text, 1, 8);
    END IF;
    RETURN NEW;
END;
$function$;

-- Fix update_product_stock_on_order
CREATE OR REPLACE FUNCTION public.update_product_stock_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    UPDATE products 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
    
    UPDATE inventory
    SET quantity = quantity - NEW.quantity
    WHERE product_id = NEW.product_id;
    
    RETURN NEW;
END;
$function$;

-- Fix update_product_view_count
CREATE OR REPLACE FUNCTION public.update_product_view_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    UPDATE products 
    SET view_count = view_count + 1
    WHERE id = NEW.id;
    RETURN NEW;
END;
$function$;

-- Fix is_driver
CREATE OR REPLACE FUNCTION public.is_driver(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM delivery_drivers WHERE user_id = _user_id
    );
END;
$function$;

-- Fix log_order_status_change
CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.order_status_history (order_id, status, changed_by, notes)
    VALUES (NEW.id, NEW.status, auth.uid(), 'Status changed from ' || OLD.status || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;