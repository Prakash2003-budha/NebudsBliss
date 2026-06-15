import React, { useState, useRef } from 'react';
import styles from './addItem.Tab.module.scss';

interface AddItemTabProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemTab: React.FC<AddItemTabProps> = ({ isOpen, onClose }) => {
  // 1. Form state tracking
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 2. Handle image selection & generate a local preview URL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 3. Reset form states on success or close
  const resetForm = () => {
    setItemName('');
    setPrice('');
    setImage(null);
    setImagePreview(null);
    onClose();
  };

  // 4. Handle actual submit logic
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName || !price) {
      alert("Please fill out the required fields!");
      return;
    }

    // Prepare data packet for your backend API/database
    const itemData = {
      name: itemName,
      price: parseFloat(price),
      imageFile: image // Send this via FormData if posting to a server
    };

    console.log("Submitting new catalog item:", itemData);
    
    // Clear data and close tab panel
    resetForm();
  };

  return (
    <div className={styles.addItemOverlay} onClick={resetForm}>
      <div className={styles.addItemTab} onClick={(e) => e.stopPropagation()}>
        <div className={styles.tabHeader}>
          <h3>Add New Item</h3>
          <button className={styles.closeButton} onClick={resetForm}>&times;</button>
        </div>
        
        <form className={styles.tabContent} onSubmit={handleSubmit}>
          
          {/* Image Upload Box */}
          <div className={styles.inputGroup}>
            <label>Item Image</label>
            <div 
              className={styles.imageUploadArea} 
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className={styles.previewImg} />
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <span>+ Upload Image</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className={styles.hiddenFileInput} 
              onChange={handleImageChange}
            />
          </div>

          {/* Item Name Input */}
          <div className={styles.inputGroup}>
            <label>Item Name *</label>
            <input 
              type="text" 
              placeholder="Enter item name..." 
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>
          
          {/* Price Input */}
          <div className={styles.inputGroup}>
            <label>Price ($) *</label>
            <input 
              type="number" 
              placeholder="0.00" 
              step="0.01" 
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Add to Catalog
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddItemTab;