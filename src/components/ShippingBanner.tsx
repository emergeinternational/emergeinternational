
import { Globe } from "lucide-react";

export const ShippingBanner = () => {
  return (
    <div className="bg-emerge-cream py-3 px-4 flex items-center justify-center gap-2 text-sm">
      <Globe size={16} />
      <span>We ship internationally! Free domestic shipping on orders over ETB 5,000</span>
    </div>
  );
};
