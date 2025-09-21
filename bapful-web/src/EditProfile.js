import React, { useState } from 'react';
import colors from './colors';
import './EditProfile.css';

const EditProfile = ({
  toggleProfileEdit,
  profileMessage,
  setProfileMessage,
  selectedFoodImages = [],
  setSelectedFoodImages,
  selectedBackground,
  setSelectedBackground
}) => {
  const [tempMessage, setTempMessage] = useState(profileMessage);
  const [tempBackground, setTempBackground] = useState(selectedBackground);
  const [tempFoodImages, setTempFoodImages] = useState([...selectedFoodImages]);

  // Default food images if none provided
  const availableFoodImages = [
    '/assets/foods/bossam.png',
    '/assets/foods/japchae.png',
    '/assets/foods/samgyetang.png',
    '/assets/foods/soondubu.png',
    '/assets/foods/tbk.png',
    '/assets/foods/yukheue.png'
  ];

  const backgroundImages = [
    '/assets/backgrounds/namsan_tower.png',
    '/assets/backgrounds/hanok.png',
    '/assets/backgrounds/palace.png'
  ];

  const handleSave = () => {
    setProfileMessage(tempMessage);
    setSelectedBackground(tempBackground);
    setSelectedFoodImages(tempFoodImages);
    toggleProfileEdit();
  };

  const handleCancel = () => {
    // Reset temporary values
    setTempMessage(profileMessage);
    setTempBackground(selectedBackground);
    setTempFoodImages([...selectedFoodImages]);
    toggleProfileEdit();
  };

  const handleFoodImageToggle = (image, index) => {
    const isSelected = tempFoodImages.includes(image);
    let newSelectedImages;

    if (isSelected) {
      newSelectedImages = tempFoodImages.filter(img => img !== image);
    } else {
      // Limit to 5 food images
      if (tempFoodImages.length < 5) {
        newSelectedImages = [...tempFoodImages, image];
      } else {
        newSelectedImages = tempFoodImages;
      }
    }

    setTempFoodImages(newSelectedImages);
  };

  const handleBackgroundSelect = (background) => {
    setTempBackground(background);
  };

  return (
    <div className="edit-profile-overlay">
      <div className="edit-profile-container">

        {/* Profile Message Section */}
        <div className="edit-message-section">
          <h3 className="edit-section-title">Edit Profile Message</h3>
          <textarea
            className="edit-message-input"
            value={tempMessage}
            onChange={(e) => setTempMessage(e.target.value)}
            placeholder="Enter your profile message..."
            maxLength={150}
            rows={4}
          />
          <div className="edit-character-count">
            {tempMessage.length}/150 characters
          </div>
        </div>

        {/* Background Selection Section */}
        <div className="edit-background-section">
          <h3 className="edit-section-title">Choose Background</h3>
          <div className="edit-background-scroll">
            {backgroundImages.map((bg, index) => (
              <div
                key={index}
                className={`edit-background-option ${tempBackground === bg ? 'selected' : ''}`}
                onClick={() => handleBackgroundSelect(bg)}
              >
                <img
                  src={bg}
                  alt={`Background ${index + 1}`}
                  className="edit-background-image"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Food Selection Section */}
        <div className="edit-food-section">
          <h3 className="edit-section-title">Select Your Favorite Foods (Max 5)</h3>
          <div className="edit-food-scroll">
            {availableFoodImages.map((food, index) => (
              <div
                key={index}
                className={`edit-food-option ${tempFoodImages.includes(food) ? 'selected' : ''}`}
                onClick={() => handleFoodImageToggle(food, index)}
              >
                <img
                  src={food}
                  alt={`Food ${index + 1}`}
                  className="edit-food-image"
                />
                {tempFoodImages.includes(food) && (
                  <div className="edit-selection-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
          <div className="edit-selection-count">
            {tempFoodImages.length}/5 foods selected
          </div>
        </div>

        {/* Action Buttons */}
        <div className="edit-button-container">
          <button
            className="edit-cancel-button"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="edit-confirm-button"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
