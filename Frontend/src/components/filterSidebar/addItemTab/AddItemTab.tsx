import React, { useState, useRef } from 'react';
import styles from './addItem.Tab.module.scss';
import PasswordConfirmModal from '../passwordAsking/PasswordConfirmModal'; 
import axios from 'axios';
import { API_ENDPOINTS } from '../../constants/constants';
import { toast } from 'react-toastify';
import { compressImages } from '../../utils/imageCompression';

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
  const [isFeatured, setIsFeatured] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isFormValid =
    formData.name.length >= 2 &&
    formData.description.length >= 10 &&
    formData.sku.trim().length > 0 &&
    formData.price !== '' &&
    !isNaN(parseFloat(formData.price)) &&
    parseFloat(formData.price) >= 0 &&
    formData.category !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      if (images.length + selectedFiles.length > 5) {
        toast.warning('You can only upload up to 5 images per product.');
        return;
      }

      if (fileInputRef.current) fileInputRef.current.value = '';

      const compressedFiles = await compressImages(selectedFiles, { maxDimension: 1600, quality: 0.82 });

      const newFiles = [...images, ...compressedFiles].slice(0, 5);
      setImages(newFiles);

      const newPreviews = compressedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
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
    setIsFeatured(false);
    setImages([]);
    setImagePreviews([]);
    setShowPasswordModal(false);
    setIsSubmitting(false);
    onClose();
  };

  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
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
    dataPayload.append('isFeatured', String(isFeatured));

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
      toast.success('Item was added to the catalog successfully.');
      resetForm();
    } catch (error: unknown) { 
      console.error("API error details:", error);
      
      if (axios.isAxiosError(error)) {
        const errorMessage = error?.response?.data?.message || "Failed to communicate with catalog database server.";
        const status = error.response?.data?.status;

        if (status === "JWT_EXPIRED" || status === "JWT_MALFORMED" || error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('accessToken'); 
          setTimeout(() => { window.location.href = '/'; }, 1500); 
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error('An unexpected error occurred while adding the product.');
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
                <label>Item Name * (min. 2 chars)</label>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    disabled={isSubmitting}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ width: 'auto' }}
                  />
                  Feature this product on the homepage poster section
                </label>
              </div>

              <div className={styles.inputGroup}>
                <label>
                  Description * (Min. 10 Chars)
                  <span style={{
                    fontWeight: 400,
                    marginLeft: 8,
                    color: formData.description.length >= 10 ? '#10b981' : '#e53935',
                    fontSize: '12px'
                  }}>
                    {formData.description.length}/10
                  </span>
                </label>
                <textarea 
                  name="description" rows={3} placeholder="Provide descriptive item details here..." disabled={isSubmitting}
                  value={formData.description} onChange={handleChange}
                />
              </div>
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || !isFormValid}
            >
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