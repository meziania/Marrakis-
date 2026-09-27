import Link from "next/link";
import { createProduct, saveProduct, setProductVisibility } from "@/lib/admin-actions";
import { getProducts } from "@/lib/store";
import type { Product } from "@/data/products";
import styles from "../../admin.module.css";

export const dynamic = "force-dynamic";

const notices: Record<string, string> = {
  created: "Product added. It is live on the shop.",
  updated: "Product saved.",
  hidden: "Product hidden from the shop. Past orders stay in analytics.",
  shown: "Product is visible on the shop again.",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; new?: string; saved?: string }>;
}) {
  const { edit, new: isNew, saved } = await searchParams;
  const products = getProducts();
  const editing = products.find((product) => product.id === edit);
  const notice = saved ? notices[saved] : "";

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>Products</h1>
        </div>
        <p className={styles.note}>
          Open a product to edit it, or hide it from the shop without deleting its orders.
        </p>
      </header>

      {notice && <p className={styles.notice}>{notice}</p>}

      <div className={styles.toolbar}>
        {isNew === "1" ? (
          <Link href="/admin/products" className="btn btn-outline">
            Cancel
          </Link>
        ) : (
          <Link href="/admin/products?new=1" className="btn btn-primary">
            Add product
          </Link>
        )}
      </div>

      {isNew === "1" && (
        <form className={`${styles.productForm} ${styles.newProduct}`} action={createProduct}>
          <div className={styles.preview}>
            <span>New product</span>
          </div>
          <ProductFields>
            <div className={`${styles.wide} ${styles.actions}`}>
              <button className="btn btn-primary" type="submit">
                Add product
              </button>
            </div>
          </ProductFields>
        </form>
      )}

      <div className={styles.stack}>
        {products.map((product) =>
          editing?.id === product.id ? (
            <form key={product.id} className={styles.productForm} action={saveProduct}>
              <input type="hidden" name="id" value={product.id} />
              <input type="hidden" name="image" value={product.image} />
              <div className={styles.preview}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.image} alt="" />
                <span>{product.price} DH</span>
              </div>
              <ProductFields product={product}>
                <div className={`${styles.wide} ${styles.actions}`}>
                  <Link href="/admin/products" className="btn btn-outline">
                    Cancel
                  </Link>
                  <button className="btn btn-primary" type="submit">
                    Save product
                  </button>
                </div>
              </ProductFields>
            </form>
          ) : (
            <article
              key={product.id}
              className={product.hidden ? `${styles.row} ${styles.rowMuted}` : styles.row}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.image} alt="" />
              <div>
                <strong>{product.name}</strong>
                <span>
                  {product.price} DH
                  {product.hidden ? " · Hidden" : ""}
                </span>
              </div>
              <div className={styles.rowActions}>
                <Link href={`/admin/products?edit=${product.id}`} className="btn btn-outline">
                  Edit
                </Link>
                <form action={setProductVisibility}>
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="hidden" value={product.hidden ? "0" : "1"} />
                  <button className={styles.textButton} type="submit">
                    {product.hidden ? "Show" : "Hide"}
                  </button>
                </form>
              </div>
            </article>
          )
        )}
      </div>
    </>
  );
}

function ProductFields({
  product,
  children,
}: {
  product?: Product;
  children?: React.ReactNode;
}) {
  return (
    <div className={styles.fields}>
      <label>
        Name
        <input name="name" required placeholder="Product name" defaultValue={product?.name} />
      </label>
      <label>
        Price (DH)
        <input
          name="price"
          type="number"
          min={0}
          required
          placeholder="0"
          defaultValue={product?.price}
        />
      </label>
      <label>
        Subtitle
        <input name="subtitle" placeholder="Short category" defaultValue={product?.subtitle} />
      </label>
      <label>
        Arabic name
        <input name="arabicName" defaultValue={product?.arabicName} />
      </label>
      <label className={styles.wide}>
        Tagline
        <input name="tagline" defaultValue={product?.tagline} />
      </label>
      <label className={styles.wide}>
        Description
        <textarea name="description" rows={3} defaultValue={product?.description} />
      </label>
      <label className={styles.wide}>
        How to use
        <textarea name="howToUse" rows={2} defaultValue={product?.howToUse ?? ""} />
      </label>
      <label className={styles.wide}>
        Benefits, one per line
        <textarea name="benefits" rows={3} defaultValue={product?.benefits.join("\n")} />
      </label>
      <label className={styles.wide}>
        {product ? "Replace image" : "Product image"}
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          required={!product}
        />
      </label>
      {children}
    </div>
  );
}
