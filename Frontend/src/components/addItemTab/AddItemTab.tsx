import React, { useState, useRef } from 'react';
import styles from './addItem.Tab.module.scss';

interface AddItemTabProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemTab: React.FC<AddItemTabProps> = ({ isOpen, onClose }) => {
  // 1. Unified state for the Mongoose Item Schema
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    sku: '',
    category: '',
    brand: '',
    stockQuantity: '0',
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generic input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image upload selector
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Reset form when panel drops down or submits successfully
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      sku: '',
      category: '',
      brand: '',
      stockQuantity: '0',
    });
    setImage(null);
    setImagePreview(null);
    onClose();
  };

  // Form submit protocol matching schema requirements
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check schema validations safely on frontend first
    if (formData.name.length < 2) return alert("Name must be at least 2 characters.");
    if (formData.description.length < 10) return alert("Description must be at least 10 characters.");
    if (parseFloat(formData.price) < 0) return alert("Price cannot be negative.");

    // Convert types exactly as Mongoose expects them
    const itemDataPacket = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
      sku: formData.sku.toUpperCase().trim(),
      category: formData.category,
      brand: formData.brand || undefined,
      stockQuantity: parseInt(formData.stockQuantity, 10),
      imageFile: image // Hand off to a FormData() class implementation for API processing
    };

    console.log("Mongoose Payload Ready:", itemDataPacket);
    
    // Perform API call action here...
    resetForm();
  };

  return (
    <div className={styles.addItemOverlay} onClick={resetForm}>
      <div className={styles.addItemTab} onClick={(e) => e.stopPropagation()}>
        <div className={styles.tabHeader}>
          <h3>Add New Catalog Item</h3>
          <button className={styles.closeButton} onClick={resetForm}>&times;</button>
        </div>
        
        <form className={styles.tabContent} onSubmit={handleSubmit}>
          <div className={styles.scrollableFormFields}>
            
            {/* Image Box Section */}
            <div className={styles.inputGroup}>
              <label>Item Image</label>
              <div className={styles.imageUploadArea} onClick={() => fileInputRef.current?.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                ) : (
                  <div className={styles.uploadPlaceholder}><span>+ Upload Image</span></div>
                )}
              </div>
              <input 
                type="file" accept="image/*" ref={fileInputRef} 
                className={styles.hiddenFileInput} onChange={handleImageChange} 
              />
            </div>

            {/* Name */}
            <div className={styles.inputGroup}>
              <label>Item Name *</label>
              <input 
                type="text" name="name" required placeholder="e.g. Butter Croissant"
                value={formData.name} onChange={handleChange}
              />
            </div>

            {/* SKU Input */}
            <div className={styles.inputGroup}>
              <label>SKU Code *</label>
              <input 
                type="text" name="sku" required placeholder="e.g. CROI-BUTR-01"
                value={formData.sku} onChange={handleChange}
              />
            </div>

            {/* Category Option Selector */}
            <div className={styles.inputGroup}>
              <label>Category *</label>
              <select name="category" required value={formData.category} onChange={handleChange}>
                <option value="">-- Choose Category --</option>
                <option value="Bakery">Bakery</option>
                <option value="Desserts">Desserts</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>

            {/* Price & Discount Row */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Price *</label>
                <input 
                  type="number" name="price" required step="0.01" min="0" placeholder="0.00"
                  value={formData.price} onChange={handleChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Discount Price</label>
                <input 
                  type="number" name="discountPrice" step="0.01" min="0" placeholder="0.00"
                  value={formData.discountPrice} onChange={handleChange}
                />
              </div>
            </div>

            {/* Brand & Stock Quantity Row */}
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Brand Name</label>
                <input 
                  type="text" name="brand" placeholder="e.g. NebudsBliss"
                  value={formData.brand} onChange={handleChange}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Stock Quantity *</label>
                <input 
                  type="number" name="stockQuantity" required min="0" placeholder="0"
                  value={formData.stockQuantity} onChange={handleChange}
                />
              </div>
            </div>

            {/* Description Textarea Area */}
            <div className={styles.inputGroup}>
              <label>Description * (Min. 10 Chars)</label>
              <textarea 
                name="description" required rows={3} placeholder="Provide descriptive item details here..."
                value={formData.description} onChange={handleChange}
              />
            </div>

          </div>

          <button type="submit" className={styles.submitButton}>Save Product Item</button>
        </form>
      </div>
    </div>
  );
};

export default AddItemTab;