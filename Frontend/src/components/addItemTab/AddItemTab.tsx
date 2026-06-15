import React, { useState, useRef } from 'react';
import styles from './addItem.Tab.module.scss';
import PasswordConfirmModal from '../passwordAsking/PasswordConfirmModal'; 
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/constants'; // Adjust this import path to match your project structure

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

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Tracks active loading state
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
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
    setImage(null);
    setImagePreview(null);
    setShowPasswordModal(false);
    setIsSubmitting(false);
    onClose();
  };

  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.length < 2) return alert("Name must be at least 2 characters.");
    if (formData.description.length < 10) return alert("Description must be at least 10 characters.");
    if (parseFloat(formData.price) < 0) return alert("Price cannot be negative.");
    if (!formData.category) return alert("Please select a product category.");

    setShowPasswordModal(true);
  };

  // Step 2: Hits your backend route using the constant values
  // 👈 FIXED: Removed '(adminPassword: string)' since it is no longer used inside the function body
  const handleFinalDatabaseSave = async () => {
    setShowPasswordModal(false); 
    setIsSubmitting(true);

    // 1. Prepare FormData because your backend uses a file upload middleware
    const dataPayload = new FormData();
    dataPayload.append('name', formData.name);
    dataPayload.append('description', formData.description);
    dataPayload.append('price', formData.price);
    dataPayload.append('sku', formData.sku.toUpperCase().trim());
    dataPayload.append('category', formData.category);
    dataPayload.append('stockQuantity', formData.stockQuantity);

    if (formData.discountPrice) dataPayload.append('discountPrice', formData.discountPrice);
    if (formData.brand) dataPayload.append('brand', formData.brand);

    // 2. Attach file binary matching the 'images' key required by your backend: uploader().array('images', 5)
    if (image) {
      dataPayload.append('images', image);
    }

    try {
      const accessToken = localStorage.getItem('accessToken');

      // 3. Make the API post request hitting: itemRouter.post('/items')
      const response = await axios.post(API_ENDPOINTS.CREATE_ITEM, dataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': accessToken ? `Bearer ${accessToken}` : ''
        },
        withCredentials: true // Includes cookies/sessions if your backend uses them for verification
      });

      console.log("Database update successful:", response.data);
      alert("Product saved successfully to database catalog!");
      resetForm();
    } catch (error: unknown) { 
      console.error("API error details:", error);
      
      if (axios.isAxiosError(error)) {
        // Grabs error message from backend body validation or general failure safely
        const errorMessage = error?.response?.data?.message || "Failed to communicate with catalog database server.";
        alert(errorMessage);

        // If user is actually unauthenticated or session has expired, boot them to login
        const status = error.response?.data?.status;
        if (status === "JWT_EXPIRED" || status === "JWT_MALFORMED" || error.response?.status === 401) {
          localStorage.removeItem('accessToken'); 
          window.location.href = '/login';
        }
      } else {
        alert("An unexpected error occurred while processing your catalog addition.");
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
          
          <form className={styles.tabContent} onSubmit={handlePreSubmitCheck}>
            <div className={styles.scrollableFormFields}>
              
              <div className={styles.inputGroup}>
                <label>Item Image</label>
                <div className={styles.imageUploadArea} onClick={() => !isSubmitting && fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className={styles.previewImg} />
                  ) : (
                    <div className={styles.uploadPlaceholder}><span>+ Upload Image</span></div>
                  )}
                </div>
                <input 
                  type="file" accept="image/*" ref={fileInputRef} disabled={isSubmitting}
                  className={styles.hiddenFileInput} onChange={handleImageChange} 
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Item Name *</label>
                <input 
                  type="text" name="name" required placeholder="e.g. Earbuds" disabled={isSubmitting}
                  value={formData.name} onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>SKU Code *</label>
                <input 
                  type="text" name="sku" required placeholder="e.g. EAR-BLIS-01" disabled={isSubmitting}
                  value={formData.sku} onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Category *</label>
                <select name="category" required value={formData.category} onChange={handleChange} disabled={isSubmitting}>
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
                    type="number" name="price" required step="0.01" min="0" placeholder="0.00" disabled={isSubmitting}
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
                    type="number" name="stockQuantity" required min="0" placeholder="0" disabled={isSubmitting}
                    value={formData.stockQuantity} onChange={handleChange}
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Description * (Min. 10 Chars)</label>
                <textarea 
                  name="description" required rows={3} placeholder="Provide descriptive item details here..." disabled={isSubmitting}
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
        // 👈 FIXED: Since handleFinalDatabaseSave doesn't accept parameters anymore, we call it cleanly here
        onConfirm={() => handleFinalDatabaseSave()}
      />
    </>
  );
};

export default AddItemTab;