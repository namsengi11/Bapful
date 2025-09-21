import React, { useState } from 'react';
import EditProfile from './EditProfile';
import colors from './colors';
import './Profile.css';

const Profile = ({
  myProfile = true,
  user = {
    name: "Your Name",
    statusMessage: "Welcome to my food journey!",
    backgroundImage: "/assets/backgrounds/namsan_tower.png",
    foodImages: [
      "/assets/foods/bossam.png",
      "/assets/foods/japchae.png",
      "/assets/foods/samgyetang.png",
      "/assets/foods/soondubu.png",
      "/assets/foods/tbk.png"
    ]
  },
  onClose,
  onLogout
}) => {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(user.statusMessage);
  const [selectedFoodImages, setSelectedFoodImages] = useState(user.foodImages.slice(0, 5));
  const [selectedBackground, setSelectedBackground] = useState(user.backgroundImage);

  // Fixed coordinates for food images (percentage-based for responsiveness)
  const foodCoordinates = [
    { left: '23%', top: '65%' },
    { left: '62%', top: '65%' },
    { left: '10%', top: '78%' },
    { left: '42%', top: '78%' },
    { left: '75%', top: '78%' }
  ];

  const toggleProfileEdit = () => {
    setIsEditingProfile(!isEditingProfile);
  };

  const handleChat = () => {
    console.log('Open chat with', user.name);
    // Implement chat functionality
  };

  return (
    <div className="user-profile-overlay">
      <div className="user-profile-container">

        {/* Background Image */}
        <img
          src={selectedBackground}
          alt="Profile Background"
          className="profile-background-image"
        />



        {/* Profile Message */}
        <div className="profile-message-display">
          <p className="profile-message-text">{profileMessage}</p>
        </div>

        {/* Food Images positioned absolutely */}
        {foodCoordinates.map((coordinate, index) => (
          <div
            key={index}
            className="food-coordinate"
            style={{
              left: coordinate.left,
              top: coordinate.top
            }}
          >
            {selectedFoodImages[index] && (
              <img
                src={selectedFoodImages[index]}
                alt={`Food ${index + 1}`}
                className="table-food-image"
              />
            )}
          </div>
        ))}

        {/* Action Button */}
        <div className="profile-action-container">
          {myProfile ? (
            <div className="profile-action-buttons">
              <button
                className="profile-action-button"
                onClick={toggleProfileEdit}
              >
                Edit Profile
              </button>
              {onLogout && (
                <button
                  className="profile-logout-button"
                  onClick={onLogout}
                >
                  Logout
                </button>
              )}
            </div>
          ) : (
            <button
              className="profile-action-button"
              onClick={handleChat}
            >
              Chat
            </button>
          )}
        </div>

        {/* Edit Profile Modal */}
        {myProfile && isEditingProfile && (
          <EditProfile
            toggleProfileEdit={toggleProfileEdit}
            profileMessage={profileMessage}
            setProfileMessage={setProfileMessage}
            selectedFoodImages={selectedFoodImages}
            setSelectedFoodImages={setSelectedFoodImages}
            selectedBackground={selectedBackground}
            setSelectedBackground={setSelectedBackground}
          />
        )}
      </div>
    </div>
  );
};

export default Profile;
