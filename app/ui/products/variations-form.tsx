'use client';

import { useState } from 'react';

export default function VariationsForm({ variations, setVariations }: { variations: any[], setVariations: (variations: any[]) => void }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [attributes, setAttributes] = useState('');
  const [variationId, setVariationId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddVariation = () => {
    const attributesArray = attributes.split(',').map(attr => attr.trim()).filter(attr => attr);
    const newVariation = { id: variationId, name, sku, price, stock, attributes: attributesArray };
    if (editingIndex !== null) {
      const newVariations = [...variations];
      newVariations[editingIndex] = newVariation;
      setVariations(newVariations);
    } else {
      setVariations([...variations, newVariation]);
    }
    setName('');
    setSku('');
    setPrice(0);
    setStock(0);
    setAttributes('');
    setEditingIndex(null);
    setVariationId(null);
  };

  const handleEditVariation = (index: number) => {
    const variation = variations[index];
    setName(variation.name);
    setSku(variation.sku);
    setPrice(variation.price);
    setStock(variation.stock);
    setAttributes(JSON.stringify(variation.attributes));
    setEditingIndex(index);
    setVariationId(variation.id);
  };

  const handleDeleteVariation = (index: number) => {
    const newVariations = variations.filter((_, i) => i !== index);
    setVariations(newVariations);
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Variations</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="variation-name" className="mb-2 block text-sm font-medium">Variation Name</label>
          <input
            id="variation-name"
            type="text"
            placeholder="Variation Name (e.g., Color)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>
        <div>
          <label htmlFor="variation-sku" className="mb-2 block text-sm font-medium">SKU</label>
          <input
            id="variation-sku"
            type="text"
            placeholder="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>
        <div>
          <label htmlFor="variation-price" className="mb-2 block text-sm font-medium">Price</label>
          <input
            id="variation-price"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>
        <div>
          <label htmlFor="variation-stock" className="mb-2 block text-sm font-medium">Stock</label>
          <input
            id="variation-stock"
            type="number"
            placeholder="Stock"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="variation-attributes" className="mb-2 block text-sm font-medium">Attributes</label>
          <textarea
            id="variation-attributes"
            placeholder="Attributes (comma-separated, e.g., red,blue,green)"
            value={attributes}
            onChange={(e) => setAttributes(e.target.value)}
            className="block w-full rounded-md border border-gray-200 py-2 px-3 text-sm outline-2 placeholder:text-gray-500"
            rows={3}
          ></textarea>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddVariation}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        {editingIndex !== null ? 'Update Variation' : 'Add Variation'}
      </button>
      {editingIndex !== null && (
        <button
          type="button"
          onClick={() => setEditingIndex(null)}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 ml-2"
        >
          Cancel
        </button>
      )}

      <div className="mt-6">
        <h4 className="text-md font-medium mb-2">Current Variations</h4>
        <ul>
          {variations.map((variation, index) => (
            <li key={variation.id || index} className="border-b py-2">
              <p><strong>Name:</strong> {variation.name}</p>
              <p><strong>SKU:</strong> {variation.sku}</p>
              <p><strong>Price:</strong> {variation.price}</p>
              <p><strong>Stock:</strong> {variation.stock}</p>
              <p><strong>Attributes:</strong> {variation.attributes.join(', ')}</p>
              <div className="flex gap-2 mt-2">
                <button type="button" onClick={() => handleEditVariation(index)} className="text-blue-500">Edit</button>
                <button type="button" onClick={() => handleDeleteVariation(index)} className="text-red-500">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}