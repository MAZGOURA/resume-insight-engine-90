import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Printer, Phone, Mail, MapPin } from "lucide-react";

interface InvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceProps {
  orderNumber: string;
  orderDate: string;
  invoiceNumber: string;
  billTo: {
    name: string;
    address: string;
    city: string;
    country: string;
    email: string;
  };
  shipTo: {
    name: string;
    address: string;
    city: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  paymentMethod: string;
  shippingMethod: string;
  trackingNumber: string;
}

export const Invoice = ({
  orderNumber,
  orderDate,
  invoiceNumber,
  billTo,
  shipTo,
  items,
  subtotal,
  shipping,
  tax,
  total,
  paymentMethod,
  shippingMethod,
  trackingNumber,
}: InvoiceProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const isFrench = i18n.language === "fr";

  const handlePrint = () => {
    window.print();
  };

  // Format currency based on locale
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === "fr" ? "fr-FR" : "en-US", {
      style: "currency",
      currency: "MAD",
    }).format(amount);
  };

  return (
    <div
      className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg print:shadow-none print:p-0 print:max-w-full"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .invoice-print-area, .invoice-print-area * {
            visibility: visible;
          }
          .invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="invoice-print-area">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isFrench ? "FACTURE" : "INVOICE"}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
              <div>
                <span className="font-medium">
                  {isFrench ? "Commande #" : "Order #"}:
                </span>{" "}
                {orderNumber}
              </div>
              <div>
                <span className="font-medium">
                  {isFrench ? "Date" : "Date"}:
                </span>{" "}
                {orderDate}
              </div>
              <div>
                <span className="font-medium">
                  {isFrench ? "Facture #" : "Invoice #"}:
                </span>{" "}
                {invoiceNumber}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600 mb-2">
              ANAS FRAGRANCES
            </div>
            <div className="text-gray-600 text-sm">
              <div className="flex items-center justify-end mb-1">
                <MapPin className="h-4 w-4 mr-1" />
                <span>123 Perfume Street, New York, NY 10001</span>
              </div>
              <div className="flex items-center justify-end mb-1">
                <Phone className="h-4 w-4 mr-1" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center justify-end">
                <Mail className="h-4 w-4 mr-1" />
                <span>hello@anasfragrances.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To / Ship To */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              {isFrench ? "Facturer à" : "Bill To"}
            </h2>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">{billTo.name}</p>
              <p>{billTo.address}</p>
              <p>{billTo.city}</p>
              <p>{billTo.country}</p>
              <p className="mt-2">{billTo.email}</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200">
              {isFrench ? "Livrer à" : "Ship To"}
            </h2>
            <div className="text-gray-600">
              <p className="font-medium text-gray-900">{shipTo.name}</p>
              <p>{shipTo.address}</p>
              <p>{shipTo.city}</p>
              <p>{shipTo.country}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            {isFrench ? "Articles" : "Items"}
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    {isFrench ? "Description" : "Description"}
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">
                    {isFrench ? "Quantité" : "Quantity"}
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">
                    {isFrench ? "Prix" : "Price"}
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">
                    {isFrench ? "Total" : "Total"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-200">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {item.description}
                      </div>
                    </td>
                    <td className="text-center py-4 px-4 text-gray-900">
                      {item.quantity}
                    </td>
                    <td className="text-right py-4 px-4 text-gray-900">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="text-right py-4 px-4 text-gray-900 font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="mb-8">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">
                  {isFrench ? "Sous-total" : "Subtotal"}
                </span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">
                  {isFrench ? "Livraison" : "Shipping"}
                </span>
                <span className="font-medium">{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">
                  {isFrench ? "Taxe" : "Tax"}
                </span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
                <span className="text-lg font-semibold text-gray-900">
                  {isFrench ? "Total" : "Total"}
                </span>
                <span className="text-lg font-semibold text-indigo-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment and Shipping Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-medium text-gray-900 mb-2 pb-1 border-b border-gray-200">
              {isFrench ? "Méthode de Paiement" : "Payment Method"}
            </h3>
            <p className="text-gray-600">{paymentMethod}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2 pb-1 border-b border-gray-200">
              {isFrench ? "Méthode d'Expédition" : "Shipping Method"}
            </h3>
            <p className="text-gray-600">{shippingMethod}</p>
          </div>
        </div>

        {/* Tracking */}
        <div className="mb-8">
          <h3 className="font-medium text-gray-900 mb-2 pb-1 border-b border-gray-200">
            {isFrench ? "Numéro de Suivi" : "Tracking Number"}
          </h3>
          <p className="text-indigo-600 font-mono">{trackingNumber}</p>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 mb-4 md:mb-0">
              {isFrench
                ? "Merci pour votre achat !"
                : "Thank you for your purchase!"}
            </p>
            <Button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-700 no-print"
            >
              <Printer className="h-4 w-4 mr-2" />
              {isFrench ? "Imprimer la Facture" : "Print Invoice"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
