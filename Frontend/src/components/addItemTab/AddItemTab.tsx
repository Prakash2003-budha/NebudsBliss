import React, { useState, useRef } from 'react';
import styles from './addItem.Tab.module.scss';
import PasswordConfirmModal from '../passwordAsking/PasswordConfirmModal'; 
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/constants';
import { showToast } from '../../utils/toast';

interface AddItemTabProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddItemTab: React.FC<AddItemTabProps> = ({ isOpen, onClose }) => {
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

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      if (images.length + selectedFiles.length > 5) {
        showToast('warning', 'Too many images', 'You can only upload up to 5 images per product.');
        return;
      }

      const newFiles = [...images, ...selectedFiles].slice(0, 5);
      setImages(newFiles);

      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[indexToRemove]);
      return prev.filter((_, index) => index !== indexToRemove);
    });
  };

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
    setImages([]);
    setImagePreviews([]);
    setShowPasswordModal(false);
    setIsSubmitting(false);
    onClose();
  };

  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.length < 2) {
      showToast('warning', 'Invalid name', 'Name must be at least 2 characters.');
      return;
    }
    if (formData.description.length < 10) {
      showToast('warning', 'Invalid description', 'Description must be at least 10 characters.');
      return;
    }
    if (!formData.sku.trim()) {
      showToast('warning', 'SKU required', 'Please enter a SKU code.');
      return;
    }
    if (!formData.price || isNaN(parseFloat(formData.price))) {
      showToast('warning', 'Price required', 'Please enter a valid price.');
      return;
    }
    if (parseFloat(formData.price) < 0) {
      showToast('warning', 'Invalid price', 'Price cannot be negative.');
      return;
    }
    if (!formData.category) {
      showToast('warning', 'Category required', 'Please select a product category.');
      return;
    }

    setShowPasswordModal(true);
  };

  const handleFinalDatabaseSave = async () => {
    setShowPasswordModal(false); 
    setIsSubmitting(true);

    const dataPayload = new FormData();
    dataPayload.append('name', formData.name);
    dataPayload.append('description', formData.description);
    dataPayload.append('price', formData.price);
    dataPayload.append('sku', formData.sku.toUpperCase().trim());
    dataPayload.append('category', formData.category);
    dataPayload.append('stockQuantity', formData.stockQuantity);

    if (formData.discountPrice) dataPayload.append('discountPrice', formData.discountPrice);
    if (formData.brand) dataPayload.append('brand', formData.brand);

    images.forEach(image => {
      dataPayload.append('images', image);
    });

    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await axios.post(API_ENDPOINTS.CREATE_ITEM, dataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': accessToken ? `Bearer ${accessToken}` : ''
        },
        withCredentials: true 
      });

      console.log("Database update successful:", response.data);
      showToast('success', 'Product saved!', 'Item was added to the catalog successfully.');
      resetForm();
    } catch (error: unknown) { 
      console.error("API error details:", error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error?.response?.data?.message || "Failed to communicate with catalog database server.";
        showToast('error', 'Failed to save', errorMessage); 

        const status = error.response?.data?.status;
        if (status === "JWT_EXPIRED" || status === "JWT_MALFORMED" || error.response?.status === 401) {
          showToast('error', 'Session expired', 'Please log in again.');
          localStorage.removeItem('accessToken'); 
          setTimeout(() => { window.location.href = '/login'; }, 1500); 
        }
      } else {
        showToast('error', 'Unexpected error', 'An unexpected error occurred while adding the product.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={styles.addItemOverlay} onClick={isSubmitting ? undefined : resetForm}>
        <div className={styles.addItemTab} onClick={(e) => e.stopPropagation()}>
          <div className={styles.tabHeader}>
            <h3>Add New Catalog Item</h3>
            <button className={styles.closeButton} disabled={isSubmitting} onClick={resetForm}>&times;</button>
          </div>
          
          <form className={styles.tabContent} onSubmit={handlePreSubmitCheck} noValidate>
            <div className={styles.scrollableFormFields}>
              
              <div className={styles.inputGroup}>
                <label>Item Images (Max 5)</label>
                <div className={styles.imageGallery}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className={styles.previewBox}>
                      <img src={preview} alt={`Preview ${index}`} className={styles.previewImg} />
                      <button 
                        type="button" 
                        className={styles.removeImgBtn} 
                        onClick={() => removeImage(index)}
                        disabled={isSubmitting}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <div className={styles.imageUploadArea} onClick={() => !isSubmitting && fileInputRef.current?.click()}>
                      <div className={styles.uploadPlaceholder}>
                        <span>+ Add ({images.length}/5)</span>
                      </div>
                    </div>
                  )}
                </div>
                <input 
                  type="file" accept="image/*" multiple ref={fileInputRef} disabled={isSubmitting}
                  className={styles.hiddenFileInput} onChange={handleImageChange} 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Item Name *</label>
                <input 
                  type="text" name="name" placeholder="e.g. Earbuds" disabled={isSubmitting}
                  value={formData.name} onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>SKU Code *</label>
                <input 
                  type="text" name="sku" placeholder="e.g. EAR-BLIS-01" disabled={isSubmitting}
                  value={formData.sku} onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Category *</label>
                <select name="category" value={formData.category} onChange={handleChange} disabled={isSubmitting}>
                  <option value="">Choose Category</option>
                  <option value="Earbuds">Earbuds</option>
                  <option value="PowerBank">Powerbank</option>
                  <option value="Camera">Camera</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Fan">Fan</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Price *</label>
                  <input 
                    type="number" name="price" step="0.01" min="0" placeholder="0.00" disabled={isSubmitting}
                    value={formData.price} onChange={handleChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Discount Price</label>
                  <input 
                    type="number" name="discountPrice" step="0.01" min="0" placeholder="0.00" disabled={isSubmitting}
                    value={formData.discountPrice} onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>Brand Name</label>
                  <input 
                    type="text" name="brand" placeholder="e.g. NebudsBliss" disabled={isSubmitting}
                    value={formData.brand} onChange={handleChange}
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Stock Quantity *</label>
                  <input 
                    type="number" name="stockQuantity" min="0" placeholder="0" disabled={isSubmitting}
                    value={formData.stockQuantity} onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Description * (Min. 10 Chars)</label>
                <textarea 
                  name="description" rows={3} placeholder="Provide descriptive item details here..." disabled={isSubmitting}
                  value={formData.description} onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? "Uploading to Server..." : "Save Product Item"}
            </button>
          </form>
        </div>
      </div>

      <PasswordConfirmModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={() => handleFinalDatabaseSave()}
      />
    </>
  );
};

export default AddItemTab;