import React, { useState, useEffect } from "react";
import M_navbar from "../../components/M_navbar";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useDarkMode } from "../../context/DarkModeContext";
import { API_BASE_URL } from "../../config/api";

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const ExecutiveWorkAreas = () => {
  const { isDarkMode } = useDarkMode();
  const [workAreas, setWorkAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: 40.7128,
    longitude: -74.0060,
    radiusMeters: 100,
  });

  useEffect(() => {
    fetchWorkAreas();
  }, []);

  const fetchWorkAreas = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/workareas`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch work areas");

      const data = await response.json();
      setWorkAreas(data);
    } catch (error) {
      console.error("Error fetching work areas:", error);
      alert("Failed to load work areas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkArea = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/workareas`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create work area");

      alert("Work area created successfully!");
      setShowCreateModal(false);
      resetForm();
      fetchWorkAreas();
    } catch (error) {
      console.error("Error creating work area:", error);
      alert("Failed to create work area. Please try again.");
    }
  };

  const handleUpdateWorkArea = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/workareas/${selectedArea.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update work area");

      alert("Work area updated successfully!");
      setShowEditModal(false);
      setSelectedArea(null);
      resetForm();
      fetchWorkAreas();
    } catch (error) {
      console.error("Error updating work area:", error);
      alert("Failed to update work area. Please try again.");
    }
  };

  const handleDeleteWorkArea = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this work area? This action cannot be undone.")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/workareas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete work area");

      alert("Work area deleted successfully!");
      // Remove the work area from state immediately instead of refetching
      setWorkAreas(prevAreas => prevAreas.filter(area => area.id !== id));
    } catch (error) {
      console.error("Error deleting work area:", error);
      alert("Failed to delete work area. Please try again.");
    }
  };

  const openEditModal = (area) => {
    setSelectedArea(area);
    setFormData({
      name: area.name,
      address: area.address || "",
      latitude: area.latitude,
      longitude: area.longitude,
      radiusMeters: area.radiusMeters,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      latitude: 40.7128,
      longitude: -74.0060,
      radiusMeters: 100,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" || name === "radiusMeters"
        ? parseFloat(value)
        : value,
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          alert("Location updated to your current position!");
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please enter coordinates manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Map click handler component
  const MapClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
      click: (e) => {
        onLocationSelect(e.latlng);
      },
    });
    return null;
  };

  const handleMapClick = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: latlng.lat,
      longitude: latlng.lng,
    }));
  };

  return (
    <>
      <M_navbar />
      <div className={`min-h-screen pt-24 px-4 pb-8 transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
          : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'
      }`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Work Area Management
              </h1>
              <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Create and manage geofenced work locations
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg inline-flex items-center"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Work Area
            </button>
          </div>

          {/* Work Areas List */}
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${(showCreateModal || showEditModal) ? 'hidden' : ''}`}>
            {loading ? (
              <div className="col-span-2 text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className={`mt-4 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading work areas...</p>
              </div>
            ) : workAreas.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-3xl shadow-lg">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No work areas yet</p>
                <p className="text-gray-400 text-sm mt-2">Create your first work area to get started</p>
              </div>
            ) : (
              workAreas.map((area) => (
                <div
                  key={area.id}
                  className={`rounded-3xl shadow-xl p-6 border-4 transition-all ${
                    area.active
                      ? 'border-green-300 bg-white'
                      : 'border-red-300 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {area.name}
                      </h3>
                      {area.address && (
                        <p className="text-gray-600 mt-1">{area.address}</p>
                      )}
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold ${
                        area.active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {area.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Map Preview */}
                  <div className="h-48 rounded-2xl overflow-hidden mb-4 border-2 border-gray-200 relative z-0">
                    <MapContainer
                      center={[area.latitude, area.longitude]}
                      zoom={15}
                      style={{ height: "100%", width: "100%", zIndex: 0 }}
                      zoomControl={false}
                      dragging={false}
                      scrollWheelZoom={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[area.latitude, area.longitude]} />
                      <Circle
                        center={[area.latitude, area.longitude]}
                        radius={area.radiusMeters}
                        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                      />
                    </MapContainer>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <span className="text-sm font-mono">
                        {area.latitude.toFixed(6)}, {area.longitude.toFixed(6)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <span className="text-sm">Radius: {area.radiusMeters}m</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(area)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all inline-flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteWorkArea(area.id)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all inline-flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Work Area Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[998] p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-4xl my-8 border-4 border-green-200 z-[999]">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-[1000]"
              onClick={() => setShowCreateModal(false)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Create Work Area
              </h2>
              <p className="text-gray-600">Define a new geofenced work location</p>
            </div>

            <form onSubmit={handleCreateWorkArea} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Work Area Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Office, Warehouse A"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-green-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Address (Optional)</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g., 123 Main St, New York"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-green-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Latitude *</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="0.000001"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-green-500 outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Longitude *</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    step="0.000001"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-green-500 outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Radius (meters) *</label>
                  <input
                    type="number"
                    name="radiusMeters"
                    value={formData.radiusMeters}
                    onChange={handleInputChange}
                    min="10"
                    max="5000"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-green-500 outline-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Range: 10m - 5000m</p>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Use My Location
                  </button>
                </div>
              </div>

              {/* Interactive Map */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Click on map to set location</label>
                <div className="h-96 rounded-2xl overflow-hidden border-4 border-green-200 relative z-[1]">
                  <MapContainer
                    key="create-map"
                    center={[formData.latitude, formData.longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[formData.latitude, formData.longitude]} />
                    <Circle
                      center={[formData.latitude, formData.longitude]}
                      radius={formData.radiusMeters}
                      pathOptions={{ color: 'green', fillColor: 'green', fillOpacity: 0.2 }}
                    />
                    <MapClickHandler onLocationSelect={handleMapClick} />
                  </MapContainer>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all text-lg shadow-lg"
                >
                  Create Work Area
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Work Area Modal */}
      {showEditModal && selectedArea && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[998] p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 relative w-full max-w-4xl my-8 border-4 border-blue-200 z-[999]">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-[1000]"
              onClick={() => {
                setShowEditModal(false);
                setSelectedArea(null);
              }}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Edit Work Area
              </h2>
              <p className="text-gray-600">Update work area details</p>
            </div>

            <form onSubmit={handleUpdateWorkArea} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Work Area Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Address (Optional)</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Latitude *</label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    step="0.000001"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Longitude *</label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    step="0.000001"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Radius (meters) *</label>
                  <input
                    type="number"
                    name="radiusMeters"
                    value={formData.radiusMeters}
                    onChange={handleInputChange}
                    min="10"
                    max="5000"
                    className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full px-6 py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors inline-flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    Use My Location
                  </button>
                </div>
              </div>

              {/* Interactive Map */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Click on map to update location</label>
                <div className="h-96 rounded-2xl overflow-hidden border-4 border-blue-200 relative z-[1]">
                  <MapContainer
                    key={`edit-map-${selectedArea.id}`}
                    center={[formData.latitude, formData.longitude]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[formData.latitude, formData.longitude]} />
                    <Circle
                      center={[formData.latitude, formData.longitude]}
                      radius={formData.radiusMeters}
                      pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
                    />
                    <MapClickHandler onLocationSelect={handleMapClick} />
                  </MapContainer>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-indigo-700 transition-all text-lg shadow-lg"
                >
                  Update Work Area
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedArea(null);
                  }}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ExecutiveWorkAreas;
