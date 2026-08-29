import RankDetailModal from "./RankDetailModal";
import BalanceDetail from "./BalanceDetail";
import KeyDetail from "./KeyDetail";
import type { Product } from "../pages/Shop";

interface Props {
  product: Product;
  onClose: () => void;
  addToCart: (product: Product) => void;
  allProducts: Product[];
}

export default function ProductDetailModal({
  product,
  onClose,
  addToCart,
  allProducts,
}: Props) {
  if (product.type === "RANK") {
    return (
      <RankDetailModal
        rank={product}
        onClose={onClose}
        addToCart={addToCart}
        allProducts={allProducts}
      />
    );
  }

  if (product.type === "BALANCE") {
    return (
      <BalanceDetail
        product={product}
        onClose={onClose}
        addToCart={addToCart}
      />
    );
  }

  if (product.type === "KEY") {
    return (
      <KeyDetail
        product={product}
        onClose={onClose}
        addToCart={addToCart}
      />
    );
  }

  return null;
}
