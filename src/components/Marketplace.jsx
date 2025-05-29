import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FaLeaf, FaGift, FaCoins, FaCheck, FaAward, FaRecycle, FaInfoCircle, FaTruck } from "react-icons/fa";

const Marketplace = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products] = useState([
    {
      id: 1,
      name: "Eco-friendly Water Bottle",
      description: "A reusable water bottle made from sustainable materials.",
      points: 2,
      image: "image here", // Replace image with text
      impact: "Saves 1,460 plastic bottles per year"
    },
    {
      id: 2,
      name: "Reusable Shopping Bag",
      description: "A durable shopping bag made from recycled materials.",
      points: 2,
      image: "image here", // Replace image with text
      impact: "Prevents 170 plastic bags from landfills"
    },
    {
      id: 3, // New product added
      name: "Compostable Phone Case",
      description: "A phone case made from compostable materials, reducing plastic waste.",
      points: 2,
      image: "image here", // Replace image with text
      impact: "Reduces 50 plastic phone cases per year"
    },
  ]);
  const [redeemedProducts, setRedeemedProducts] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleRedeem = async (product) => {
    const user = auth.currentUser;
    if (user && userData.points >= product.points) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          points: userData.points - product.points,
        });
        setUserData((prevData) => ({
          ...prevData,
          points: prevData.points - product.points,
        }));
        setRedeemedProducts((prev) => [...prev, product.id]);
      } catch (error) {
        console.error("Error redeeming product:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-green-100 to-green-50 py-12 px-4">
      <div className="mt-20 max-w-7xl mx-auto mb-16">
        <div className="text-center relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl">
              <FaGift className="text-white text-4xl" />
            </div>
          </div>
          <div className="pt-16">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">Eco Rewards Marketplace</h1>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto leading-relaxed">
              Transform your eco-points into sustainable products and make a positive impact on our planet
            </p>
          </div>
        </div>

        <div className="mt-12 max-w-sm mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaCoins className="text-yellow-500 text-2xl" />
                </div>
                <div>
                  <p className="text-gray-500">Available Points</p>
                  <p className="text-3xl font-bold text-green-600">{userData.points}</p>
                </div>
              </div>
              <FaAward className="text-green-400 text-4xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-64">
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-500">{product.image}</span> {/* Display "image here" */}
                </div>
                <div className="absolute top-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center">
                    <FaLeaf className="text-green-500 mr-2" />
                    <span className="font-bold">{product.points} points</span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h2 className="text-2xl font-bold mb-3 text-gray-800">{product.name}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                
                <div className="bg-green-50 rounded-xl p-5 mb-6">
                  <div className="flex items-center text-green-700 space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaRecycle className="text-xl" />
                    </div>
                    <div>
                      <p className="font-medium">Environmental Impact</p>
                      <p className="text-sm text-green-600">{product.impact}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRedeem(product)}
                  disabled={userData.points < product.points || redeemedProducts.includes(product.id)}
                  className={`w-full rounded-xl py-4 px-6 font-medium transition-all duration-300 flex items-center justify-center
                    ${
                      redeemedProducts.includes(product.id)
                        ? "bg-gray-100 text-gray-500"
                        : userData.points >= product.points
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                >
                  {redeemedProducts.includes(product.id) ? (
                    <div className="flex items-center space-x-2">
                      <FaCheck className="text-xl" />
                      <span>Redeemed</span>
                    </div>
                  ) : userData.points < product.points ? (
                    <div className="flex items-center space-x-2">
                      <FaCoins className="text-xl" />
                      <span>Need {product.points - userData.points} more points</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FaGift className="text-xl" />
                      <span>Redeem Now</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[  
            {
              icon: FaInfoCircle,
              title: "How It Works",
              description: "Earn points through eco-friendly actions and redeem them for sustainable products.",
              color: "from-blue-400 to-blue-600"
            },
            {
              icon: FaTruck,
              title: "Shipping Info",
              description: "All products are shipped using eco-friendly packaging and carbon-neutral delivery.",
              color: "from-green-400 to-green-600"
            },
            {
              icon: FaLeaf,
              title: "Environmental Impact",
              description: "Each product is carefully selected to ensure maximum positive environmental impact.",
              color: "from-teal-400 to-teal-600"
            }
          ].map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
              <div className={`bg-gradient-to-r ${item.color} p-6 group-hover:scale-105 transition-transform duration-300`}>
                <item.icon className="text-white text-4xl" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
