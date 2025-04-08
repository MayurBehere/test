import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";

// Spinner component
const Spinner = () => (
  <div className="flex justify-center items-center mt-4">
    <div className="w-8 h-8 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
  </div>
);

const SessionPage = () => {
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const uid = location.state?.uid || storedUser?.uid;

  const { sessionId } = useParams();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [classificationResult, setClassificationResult] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const IMGBB_API_KEY = "cd27a84e52dc99425cc000fe71e8156b";

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        if (!sessionId) {
          console.error("Invalid sessionId");
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:5000/session/${sessionId}`
        );
        console.log("Session details response:", response.data);

        const { image_url, session_name, created_at, classification_results } =
          response.data;

        // Handle single image URL
        const extractedImages = image_url ? [image_url] : [];

        console.log("Extracted Images:", extractedImages);
        console.log("Classification Results:", classification_results);

        setImageUrls(extractedImages || []);
        setSessionInfo({ session_name, created_at });
        setClassificationResult(classification_results || null);
      } catch (error) {
        console.error("Failed to fetch session details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.type !== "image/jpeg") {
      alert("Only JPG images are allowed.");
      return;
    }

    setImage(file);
    setClassificationResult(null); // reset classification on new image
  };

  const uploadImage = async () => {
    if (!uid) {
      alert("User ID not found. Please log in again.");
      return;
    }

    if (!image) {
      alert("Please select a JPG image first.");
      return;
    }

    setUploading(true);

    try {
      // Step 1: Upload to ImgBB
      const formData = new FormData();
      formData.append("image", image);
      formData.append("key", IMGBB_API_KEY);

      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        formData
      );
      console.log("ImgBB upload response:", response.data);

      const data = response.data?.data;

      if (!data?.display_url || !data?.delete_url) {
        throw new Error("Incomplete upload data from ImgBB.");
      }

      const imageObject = {
        url: data.display_url,
        delete_url: data.delete_url,
      };

      console.log("Image Object to Send to Backend:", imageObject);

      // Step 2: Send image URL to backend for classification
      const backendResponse = await axios.post(
        `http://127.0.0.1:5000/session/${sessionId}/upload-image`,
        {
          uid,
          image_urls: [imageObject],
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Backend classification response:", backendResponse.data);

      // Step 3: Re-fetch updated session data to get classification result
      const sessionRes = await axios.get(
        `http://127.0.0.1:5000/session/${sessionId}`
      );
      console.log("Updated session details response:", sessionRes.data);

      const updated = sessionRes.data;

      const extractedImages = updated.image_url ? [updated.image_url] : [];

      console.log("Updated Extracted Images:", extractedImages);
      console.log(
        "Updated Classification Results:",
        updated.classification_results
      );

      setClassificationResult(
        updated.classification_results || "No result returned"
      );
      setImageUrls(extractedImages || []);
      setSessionInfo({
        session_name: updated.session_name,
        created_at: updated.created_at,
      });

      alert("Image successfully uploaded and classified.");
      setImage(null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-5 max-w-2xl mx-auto relative">
      <h2 className="text-3xl font-bold mb-4 text-center text-blue-600">
        Upload Image for Session
      </h2>

      {loading ? (
        <div className="w-full animate-pulse mb-6">
          <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : sessionInfo ? (
        <div className="text-center text-gray-700 mb-6">
          <p className="text-xl font-medium">{sessionInfo.session_name}</p>
          <p className="text-sm text-gray-500">
            Created on:{" "}
            <span className="font-medium text-gray-700">
              {new Date(sessionInfo.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>{" "}
            at{" "}
            <span className="font-medium text-gray-700">
              {new Date(sessionInfo.created_at).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-d",
              })}
            </span>
          </p>
        </div>
      ) : (
        <p className="text-red-500 mb-4">Session info not found.</p>
      )}

      {classificationResult ? (
        <div className="mt-4 p-4 bg-green-100 text-green-800 rounded text-left w-full">
          <p className="font-semibold">Classification Result:</p>
          <ul className="list-disc list-inside">
            <li>
              <strong>Acne Type:</strong> {classificationResult.acne_type}
            </li>
            <li>
              <strong>Confidence:</strong>{" "}
              {(classificationResult.confidence * 100).toFixed(2)}%
            </li>
            <li>
              <strong>Recommendations:</strong>{" "}
              {classificationResult.recommendations || "None"}
            </li>
          </ul>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-2">
            Only 1 JPG image per session is allowed.
          </p>
          <input
            type="file"
            accept="image/jpeg"
            onChange={handleImageChange}
            className="mb-3"
            disabled={imageUrls.length > 0}
          />

          {image && (
            <div className="relative mb-4">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="w-32 h-32 object-cover rounded-md shadow-md"
              />
              <button
                onClick={() => setImage(null)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={uploadImage}
            disabled={uploading || imageUrls.length > 0}
            className="mb-4 bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 transition"
          >
            {uploading ? "Uploading..." : "Upload & Classify"}
          </button>

          {uploading && <Spinner />}
        </>
      )}

      <h3 className="text-xl font-semibold mt-8 mb-2">Uploaded Images</h3>
      {imageUrls.length === 0 ? (
        <p className="text-gray-500">No image uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative">
              <img
                src={url}
                alt={`Uploaded ${index}`}
                className="w-24 h-24 object-cover rounded-md border shadow cursor-pointer"
                onClick={() => setPreviewImage(url)}
              />
            </div>
          ))}
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-screen rounded-lg"
            />
            <button
              className="absolute top-2 right-2 text-white bg-red-500 px-2 py-1 rounded"
              onClick={() => setPreviewImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionPage;
