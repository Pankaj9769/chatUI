import React, { useState } from "react";
import { PencilIcon, CheckIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { API_LINK } from "@/utils/link";
import { Account, Client, Storage } from "appwrite";
// const client = new Client()
//   .setProject("67692a65002c349b75f3")
//   .setEndpoint("https://cloud.appwrite.io/v1");

// const storage = new Storage(client);
const Profile = () => {
  // const account = new Account(client);
  const [profileImage, setProfileImage] = useState(
    "/placeholder.svg?height=200&width=200"
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [, setName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const handleImageChange = async (e) => {
    // const session = await account.getSession("current"); // Get the current session

    // if (!session) {
    //   console.error("User is not authenticated");
    //   return;
    // }

    // You need to set the session JWT token before making requests to the Appwrite server
    // client.setJWT(session.jwt);
    const file = e.target.files[0]; // Get the selected file
    if (file) {
      // Preview the image using FileReader (Base64 encoding)
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); // Set the base64 image for preview
      };
      reader.readAsDataURL(file);

      // You can store the file for upload later
      setSelectedFile(file); // Store the actual file (you'll send this in the upload request)
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileImage) {
      toast.error("No file selected!");
      return;
    }

    // const formData = new FormData();
    // formData.append("file", selectedFile); // Attach file
    // formData.append("email", user.email); // Attach email

    // try {
    //   const file = formData.get("file");

    //   const resp = await storage.createFile(
    //     "6769bb3300271c8d647f", // Your Appwrite bucket ID
    //     file.name, // The file name, you can generate a unique name here if needed
    //     file // The file itself
    //   );
    //   console.log("resp");
    //   console.log(resp);
    //   const updateResponse = await fetch(
    //     `${API_LINK}api/update-profile-image`,
    //     {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify({
    //         email: user.email,
    //         responseId: resp.$id,
    //       }),
    //     }
    //   );

    //   const updateData = await updateResponse.json();
    //   if (updateData.success) {
    //     toast.success("Profile image updated successfully!");
    //   } else {
    //     toast.error("Failed to update profile image in the database.");
    //   }

    // Check if the response is in JSON format
    // } catch (error) {
    //   console.error("Error uploading image:", error);
    //   toast.error("Failed to upload image.");
    // }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer"
              >
                <PencilIcon className="w-4 h-4" />
              </label>
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <div className="flex items-center">
              {isEditingName ? (
                <input
                  type="text"
                  id="name"
                  value={user.name}
                  onChange={handleNameChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <span className="text-lg">{user.name}</span>
              )}
              <button
                type="button"
                onClick={() => setIsEditingName(!isEditingName)}
                className="ml-2 text-blue-500"
              >
                {isEditingName ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <PencilIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <div className="flex items-center">
              {isEditingEmail ? (
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  onChange={handleEmailChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              ) : (
                <span className="text-lg">{user.email}</span>
              )}
              <button
                type="button"
                onClick={() => setIsEditingEmail(!isEditingEmail)}
                className="ml-2 text-blue-500"
              >
                {isEditingEmail ? (
                  <CheckIcon className="w-5 h-5" />
                ) : (
                  <PencilIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default Profile;
