import { useAuth } from "./AuthContext";

export default function DebugUser() {
  const { isGuest, isLoggedIn, userInfo } = useAuth();

  return (
    <div className="p-4 bg-gray-100 border mt-4 rounded">
      <h2 className="text-lg font-bold">Auth Debug Info</h2>
      <p>Logged In: {isLoggedIn ? "✅ Yes" : "❌ No"}</p>
      {userInfo ? (
        <pre className="mt-2 bg-white p-2 rounded text-sm overflow-auto">
          {JSON.stringify(userInfo, null, 2)}
        </pre>
      ) : (
        <p>No user info available</p>
      )}
    </div>
  );
}