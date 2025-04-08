import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const Main = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const initUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      if (storedUser && Date.now() - storedUser.timestamp < 10 * 60 * 1000) {
        setUser(storedUser);
        await fetchUser(storedUser.uid);
        fetchSessions(storedUser.uid);
      } else {
        onAuthStateChanged(auth, async (currentUser) => {
          if (currentUser) {
            const userData = {
              uid: currentUser.uid,
              name: currentUser.displayName || "",
              timestamp: Date.now(),
            };
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            await fetchUser(currentUser.uid);
            fetchSessions(currentUser.uid);
          } else {
            navigate("/login");
          }
        });
      }
    };

    initUser();
  }, [auth, navigate]);

  const fetchUser = async (uid) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/auth/check-user-info",
        { uid }
      );

      const fetchedName = response.data.name;

      setUser((prev) => ({
        ...prev,
        name: fetchedName || prev.name,
      }));

      if (!fetchedName || fetchedName.trim() === "" || fetchedName.trim().toLowerCase() === "unknown") {
        setName(""); // Clear input for user to enter new name
        setShowDialog(true);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchSessions = async (uid) => {
    try {
      if (!uid) return;
      
      setSessions([]); // Clear sessions while loading
      console.log("Fetching sessions for UID:", uid); // Add for debugging
      
      const response = await axios.get(
        "http://127.0.0.1:5000/session/get-sessions",
        { params: { uid } }
      );
      
      console.log("Sessions response:", response.data); // Add for debugging
      setSessions(response.data.sessions || []);
      
    } catch (error) {
      console.error("Error fetching sessions:", error);
      // Display a user-friendly error message
      alert("Failed to load your sessions. Please refresh the page.");
    }
  };

  const updateName = async () => {
    try {
      const currentUser = auth.currentUser;

      await axios.post("http://127.0.0.1:5000/auth/update-name", {
        uid: currentUser.uid,
        name: name,
      });

      setUser((prev) => ({ ...prev, name }));
      setShowDialog(false);
      fetchUser(currentUser.uid);
    } catch (error) {
      console.error("Error updating name", error);
    }
  };

  const createSession = async () => {
    try {
      const currentUser = auth.currentUser;
      const sessionName = prompt("Enter a unique name for this session:");
      if (!sessionName) {
        alert("Session name cannot be empty.");
        return;
      }

      const response = await axios.post(
        "http://127.0.0.1:5000/session/start-session",
        {
          uid: currentUser.uid,
          session_name: sessionName,
        }
      );

      const sessionId = response.data.session_id;
      fetchSessions(currentUser.uid);

      navigate(`/session/${sessionId}`, { state: { uid: currentUser.uid } });
    } catch (error) {
      console.error("Error creating session", error);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await axios.delete(
        `http://127.0.0.1:5000/session/delete-session/${sessionId}`
      );

      setSessions(
        sessions.filter((session) => session.session_id !== sessionId)
      );
    } catch (error) {
      console.error("Error deleting session", error);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">
        Welcome, {user?.name || "Guest"}
      </h1>
      <button
        onClick={handleLogout}
        className="mt-5 bg-red-500 text-white p-3 rounded"
      >
        Logout
      </button>

      {showDialog && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg">
            <h2 className="text-lg font-semibold">Update Your Name</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 w-full"
              placeholder="Enter your name"
            />
            <button
              onClick={updateName}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <button
        onClick={createSession}
        className="mt-5 bg-green-500 text-white text-xl p-6 rounded-full"
      >
        +
      </button>

      <div className="mt-5 w-1/2">
        <h2 className="text-xl font-semibold">Past Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-gray-500">No past sessions</p>
        ) : (
          <ul className="mt-2">
            {sessions.map((session) => (
              <li
                key={session.session_id}
                className="p-3 border rounded my-2 cursor-pointer hover:bg-gray-100"
                onClick={() =>
                  navigate(`/session/${session.session_id}`, {
                    state: { uid: user?.uid, viewOnly: true },
                  })
                }
              >
                {session.session_name || "Unnamed Session"}
                <button
                  className="ml-4 bg-red-500 text-white px-2 py-1 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.session_id);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Main;