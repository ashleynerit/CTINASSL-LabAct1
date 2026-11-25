import { useState } from "react";
import { getProductIdLabel } from "../../Data/products";
import { apiRequest } from "../../utils/api";

const LOW_STOCK_THRESHOLD = 5;

export default function Inventory({ products, setProducts }) {
  const [query, setQuery] = useState("");
  const [stockDrafts, setStockDrafts] = useState({});
  const [message, setMessage] = useState("");

  const filteredProducts = [...products]
    .filter((product) => {
      const searchText = `${product.name} ${product.category} ${product.id}`
        .toLowerCase();
      return searchText.includes(query.toLowerCase());
    })
    .sort((first, second) => Number(first.stock) - Number(second.stock));

  const updateStock = async (event, product) => {
    event.preventDefault();
    const rawStock = stockDrafts[product.id] ?? String(product.stock);
    const nextStock = Number(rawStock);

    if (!Number.isInteger(nextStock) || nextStock < 0) {
      setMessage("Enter a whole number of zero or more.");
      return;
    }

    setMessage("");
    try {
      const result = await apiRequest(
        `/api/admin/products/${encodeURIComponent(product.id)}`,
        { method: "PATCH", body: { stock: nextStock } }
      );
      setProducts((currentProducts) =>
        currentProducts.map((item) =>
          item.id === product.id ? result.product : item
        )
      );
      setStockDrafts((drafts) => ({ ...drafts, [product.id]: undefined }));
      setMessage(`Stock updated for ${product.name}.`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const lowStockCount = products.filter(
    (product) => Number(product.stock) <= LOW_STOCK_THRESHOLD
  ).length;

  return (
    <main className="section">
      <div className="admin-page-heading">
        <div>
          <p className="accent">STOCK CONTROL</p>
          <h1>Inventory</h1>
          <p>Update stock counts and quickly find items that need replenishing.</p>
        </div>
        <div className="admin-summary-chip">
          Low stock: <strong>{lowStockCount}</strong>
        </div>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search">
          <span className="sr-only">Search inventory</span>
          <input
            type="search"
            placeholder="Search by item, category, or ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </div>

      {message && <p className="admin-feedback" role="status">{message}</p>}

      {filteredProducts.length === 0 ? (
        <p className="admin-empty">No inventory items match your search.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">ID</th>
                <th scope="col">Category / Series</th>
                <th scope="col">Current stock</th>
                <th scope="col">Set stock</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stock = Number(product.stock);
                const isLowStock = stock <= LOW_STOCK_THRESHOLD;

                return (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                      {isLowStock && (
                        <span className="low-stock-label">Low stock</span>
                      )}
                    </td>
                    <td>{getProductIdLabel(product)}</td>
                    <td>
                      {product.category}
                      {product.series ? ` · ${product.series}` : ""}
                    </td>
                    <td>{stock}</td>
                    <td>
                      <form
                        className="inventory-stock-form"
                        onSubmit={(event) => updateStock(event, product)}
                      >
                        <input
                          type="number"
                          min="0"
                          step="1"
                          aria-label={`Set stock for ${product.name}`}
                          value={stockDrafts[product.id] ?? String(product.stock)}
                          onChange={(event) =>
                            setStockDrafts((drafts) => ({
                              ...drafts,
                              [product.id]: event.target.value
                            }))
                          }
                        />
                        <button className="admin-button" type="submit">
                          Update
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}