import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaCalendar, FaStar, FaTrophy, FaEdit, FaSave, FaLeaf } from "react-icons/fa";
import { reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setName(data.name);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []); 

  // Update the user's points when there's a change
  useEffect(() => {
    const fetchUserPoints = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData((prevData) => ({
            ...prevData,
            points: data.points,
          }));
        }
      }
    };

    fetchUserPoints();
  }, [userData?.points]); // Depend on points so it re-fetches when updated

  const handleSave = async () => {
    if (!auth.currentUser) {
      alert("User is not logged in.");
      return;
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);

      // Update name in Firestore
      const updatedData = { name };

      // Handle password update if a new password is provided
      if (password) {
        const user = auth.currentUser;

        // Re-authenticate the user before updating the password
        const credential = EmailAuthProvider.credential(
          user.email,
          prompt("Please enter your current password to re-authenticate:")
        );

        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, password);
        console.log("Password updated successfully");
      }

      await updateDoc(userRef, updatedData);

      // Update local state
      setUserData((prev) => ({
        ...prev,
        ...updatedData,
      }));

      setEditMode(false); // Exit edit mode
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile: ", error);
      alert(
        error.code === "auth/requires-recent-login"
          ? "Please log in again to update your password."
          : "Failed to update profile. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <FaUser className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No user data found.</p>
        </div>
      </div>
    );
  }

  const calculateUserLevel = (points) => {
    const level = Math.floor(points / 100) + 1;
    const progress = (points % 100) / 100;
    return { level, progress };
  };

  const { level, progress } = calculateUserLevel(userData.points || 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-400 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-green-600 shadow-lg">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{userData.name}</h1>
                  <p className="text-green-100 flex items-center">
                    <FaLeaf className="mr-2" /> Eco Enthusiast
                  </p>
                </div>
              </div>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-white text-green-600 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-50 transition-colors duration-300"
                >
                  <FaEdit />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            {editMode ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-300"
                  />
                </div>
                <button
                  onClick={handleSave}
                  className="w-full bg-green-600 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors duration-300"
                >
                  <FaSave />
                  <span>Save Changes</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaEnvelope className="text-green-600" />
                      <div>
                        <p className="text-sm">Email</p>
                        <p className="font-medium">{userData.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaCalendar className="text-green-600" />
                      <div>
                        <p className="text-sm">Member Since</p>
                        <p className="font-medium">
                          {new Date(userData.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaStar className="text-green-600" />
                      <div>
                        <p className="text-sm">Total Points</p>
                        <p className="font-medium">{userData.points || 0} points</p>
                        <p className="text-sm text-gray-500">You can use these points to redeem any product in marketplace</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <FaTrophy className="text-green-600 mr-2" />
                      Level Progress
                    </h2>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Level {level}</span>
                        <span className="text-sm font-medium text-gray-600">{Math.round(progress * 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-green-600 rounded-full transition-all duration-300"
                          style={{ width: `${progress * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;