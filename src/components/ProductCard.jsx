import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import { FaLeaf, FaHeart, FaShoppingCart, FaInfoCircle } from "react-icons/fa";

const ProductCard = ({ item }) => {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch price from API
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`https://api.yourpriceapi.com/products?url=${encodeURIComponent(item.link)}`);
        const data = await response.json();
        setPrice(data.price);
      } catch (error) {
        console.error("Error fetching price:", error);
        // Set a mock price for demonstration
        setPrice({
          current: Math.floor(Math.random() * 10) + 20,
          currency: "USD",
          saved: Math.floor(Math.random() * 20),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [item.link]);

  const image = item.pagemap?.cse_image?.[0]?.src || "/placeholder-image.jpg";

  // Expanded ecoAttributes
  const ecoAttributes = {
    recycling: [
      "recyclable", 
      "recycled materials",
      "zero waste"
    ],
    practices: [
      "sustainable production",
      "eco-friendly manufacturing",
      "carbon neutral"
    ],
    impact: [
      "biodegradable",
      "plastic-free",
      "renewable"
    ],
    material: [
      "bamboo",
      "organic cotton",
      "hemp",
      "cotton",
      "silk",
      "wool",
      "linen",
      "wood",
      "leather",
    ]
  };

  // Calculate eco score based on attributes in title or description
  const calculateEcoScore = () => {
    let score = 0;
    Object.values(ecoAttributes).forEach((attributes) => {
      attributes.forEach((attribute) => {
        if (
          item.title.toLowerCase().includes(attribute) || item.snippet.toLowerCase().includes(attribute)
        ) {
          score += 20;
        }
      });
    });
    return Math.min(score, 100);  // Ensure the score doesn't exceed 100
  };

  const ecoScore = calculateEcoScore();

  const getEcoScoreColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-green-400";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-yellow-400";
    return "bg-red-500";
  };

  const getEcoScoreExplanation = () => {
    let explanation = "";
    
    if (ecoScore >= 50) {
      explanation = `
        ✓ High sustainability score
        ✓ Uses eco-friendly manufacturing
        ✓ Has recycling initiatives
        ✓ Minimal environmental impact
      `;
    } else if (ecoScore >= 20) {
      explanation = `
        ✓ Moderate eco-friendly features
        ⚠ Could improve recycling practices
        ⚠ Partial sustainable materials used
        ℹ Consider more eco-friendly alternatives
      `;
    } else {
      explanation = `
        ✗ Limited sustainability features
        ✗ No clear recycling information
        ✗ High environmental impact
        ℹ Look for more sustainable options
      `;
    }

    return (
      <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800">
          Sustainability Analysis:
        </h4>
        <pre className="whitespace-pre-line text-sm text-gray-600">
          {explanation}
        </pre>
        <p className="text-sm text-gray-500 mt-2">
          {ecoScore >= 80 ? 
            "This product demonstrates strong commitment to environmental sustainability." :
            "This product could benefit from improved sustainability practices."}
        </p>
      </div>
    );
  };

  const awardPoints = async () => {
    if (ecoScore >= 20) {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          points: increment(0.5),
        });
      }
    }
  };
  

  const addToWishlist = async (e) => {
    e.stopPropagation();
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          wishlist: arrayUnion({
            title: item.title,
            link: item.link,
            image: image,
            ecoScore: ecoScore,
            price: price?.current,
            currency: price?.currency,
          }),
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2">
      {/* Image Section */}
      <div className="relative h-48">
        <img
          src={image}
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "/placeholder-image.jpg")}
        />
        <div className="absolute top-0 right-0 m-2 flex gap-2">
          <button
            onClick={addToWishlist}
            className={`p-2 rounded-full ${isWishlisted ? 'bg-red-500' : 'bg-white'} shadow-md transition-colors duration-300`}
          >
            <FaHeart className={`${isWishlisted ? 'text-white' : 'text-red-500'}`} />
          </button>
        </div>
        
        {/* Eco Score Badge */}
        <div className="absolute bottom-0 left-0 m-2">
          <div className="flex items-center bg-white rounded-full px-3 py-1 shadow-md">
            <FaLeaf className={`mr-1 ${getEcoScoreColor(ecoScore)} text-white rounded-full p-1`} />
            <span className="font-bold">{ecoScore}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{item.title}</h3>
        
        {/* Price Section */}
        <div className="mb-3">
          {loading ? (
            <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">
                ${price?.current}
              </span>
              {price?.saved > 0 && (
                <span className="text-sm text-green-500">
                  Save ${price.saved}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Eco Information */}
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center text-sm text-gray-600 hover:text-green-600"
          >
            <FaInfoCircle className="mr-1" />
            Sustainability Details
          </button>
          {showDetails && (
            <div className="mt-2 p-4 bg-green-50 rounded-lg text-sm">
              {getEcoScoreExplanation()}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={awardPoints}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-full text-center font-medium hover:bg-green-700 transition-colors duration-300"
          >
            View Product
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToWishlist(e);
            }}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
          >
            <FaShoppingCart className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
