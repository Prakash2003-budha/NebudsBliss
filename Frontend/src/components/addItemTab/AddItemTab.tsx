import React, { useState, useRef } from 'react';
import styles from './addItem.Tab.module.scss';
import PasswordConfirmModal from '../passwordAsking/PasswordConfirmModal'; 

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State flag tracking whether the user validation password screen is active
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);

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
    onClose();
  };

  // Step 1: Intercept the regular submission event layout flow
  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.name.length < 2) return alert("Name must be at least 2 characters.");
    if (formData.description.length < 10) return alert("Description must be at least 10 characters.");
    if (parseFloat(formData.price) < 0) return alert("Price cannot be negative.");
    if (!formData.category) return alert("Please select a product category.");

    // Form validation checks passed cleanly, show password modal prompt now
    setShowPasswordModal(true);
  };

  // Step 2: Executes when the password modal handles validation confirmation
  const handleFinalDatabaseSave = (adminPassword: string) => {
    const itemDataPacket = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : undefined,
      sku: formData.sku.toUpperCase().trim(),
      category: formData.category,
      brand: formData.brand || undefined,
      stockQuantity: parseInt(formData.stockQuantity, 10),
      imageFile: image,
      verificationPassword: adminPassword // Send this over to your node backend API router to cross check hash keys
    };

    console.log("Mongoose Payload Securely Authorized. Sending to API server:", itemDataPacket);
    
    // Perform your backend Axios/Fetch POST dispatch call here:
    // axios.post('/api/items', itemDataPacket)...

    alert("Product saved successfully to database catalog!");
    resetForm();
  };

  return (
    <>
      <div className={styles.addItemOverlay} onClick={resetForm}>
        <div className={styles.addItemTab} onClick={(e) => e.stopPropagation()}>
          <div className={styles.tabHeader}>
            <h3>Add New Catalog Item</h3>
            <button className={styles.closeButton} onClick={resetForm}>&times;</button>
          </div>
          
          <form className={styles.tabContent} onSubmit={handlePreSubmitCheck}>
            <div className={styles.scrollableFormFields}>
              
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

              <div className={styles.inputGroup}>
                <label>Item Name *</label>
                <input 
                  type="text" name="name" required placeholder="e.g. Earbuds"
                  value={formData.name} onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>SKU Code</label>
                <input 
                  type="text" name="sku" required placeholder="e.g. CROI-BUTR-01"
                  value={formData.sku} onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Category *</label>
                <select name="category" required value={formData.category} onChange={handleChange}>
                  <option value="">Choose Category</option>
                  <option value="Earbuds">Earbuds</option>
                  <option value="Powerbank">Powerbank</option>
                  <option value="Camera">Camera</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Fan">Fan</option>
                </select>
              </div>

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

      {/* Render password modal window overlay tier */}
      <PasswordConfirmModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onConfirm={handleFinalDatabaseSave}
      />
    </>
  );
};

export default AddItemTab;