import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  Phone,
  MessageSquare,
  List,
  Map as MapIcon,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  Send,
  X,
  Navigation,
} from 'lucide-react';
import { api } from '../services/api';
import { BloodBadge } from '../components/BloodBadge';
import { ScoreBreakdownModal } from '../components/ScoreBreakdownModal';
import { LeafletMap } from '../components/LeafletMap';
import { ALL_BLOOD_GROUPS } from '../utils/bloodCompatibility';
import { useAuth } from '../context/AuthContext';

export const FindDonorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();

  // Filters
  const [bloodGroup, setBloodGroup] = useState<string>(searchParams.get('bloodGroup') || 'O+');
  const [city, setCity] = useState<string>(searchParams.get('city') || 'Bengaluru');
  const [pincode, setPincode] = useState<string>('');
  const requestedRadius = Number.parseInt(searchParams.get('radius') || '30', 10);
  const [radius, setRadius] = useState<number>(
    Number.isFinite(requestedRadius) ? Math.min(100, Math.max(5, requestedRadius)) : 30
  );
  const [onlyAvailable, setOnlyAvailable] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<string>('distance'); // 'score' | 'distance' | 'freshness'
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [locationStatus, setLocationStatus] = useState<string>('');

  // Coordinates
  const [latitude, setLatitude] = useState<number | undefined>(12.9716);
  const [longitude, setLongitude] = useState<number | undefined>(77.5946);

  // Results & States
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Selected Donor for Explainability Modal
  const [selectedDonorForScore, setSelectedDonorForScore] = useState<any | null>(null);

  // Outreach Contact Modal
  const [contactModalDonor, setContactModalDonor] = useState<any | null>(null);
  const [outreachMessage, setOutreachMessage] = useState<string>('');
  const [outreachSuccess, setOutreachSuccess] = useState<string>('');
  const [outreachSending, setOutreachSending] = useState<boolean>(false);

  const fetchDonors = async (location = { latitude, longitude, city, pincode }) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.searchDonors({
        bloodGroup: bloodGroup !== 'ALL' ? bloodGroup : undefined,
        city: location.city.trim() || undefined,
        pincode: location.pincode.trim() || undefined,
        radius,
        latitude: location.latitude,
        longitude: location.longitude,
        onlyAvailable,
        sortBy,
      });

      if (res.success) {
        setDonors(res.donors || []);
      } else {
        setError(res.error || 'Failed to search donors');
      }
    } catch {
      setError('Network connection error while searching donors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, sortBy, onlyAvailable]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonors();
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Location services are not supported by this browser.');
      return;
    }

    setLocationStatus('Requesting your location...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { latitude: coords.latitude, longitude: coords.longitude, city: '', pincode: '' };
        setLatitude(location.latitude);
        setLongitude(location.longitude);
        setCity('');
        setPincode('');
        setLocationStatus('Using your location. Donor locations remain approximate.');
        fetchDonors(location);
      },
      () => setLocationStatus('Location unavailable or permission denied. You can search by city instead.'),
      { timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleSendContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in or register to send verified contact inquiries to donors.');
      return;
    }
    if (!contactModalDonor) return;

    setOutreachSending(true);
    try {
      // First check if user has an active request to associate with, or use emergency channel
      const requestsRes = await api.listMyRequests();
      let requestId = '';
      if (requestsRes.success && requestsRes.requests && requestsRes.requests.length > 0) {
        requestId = requestsRes.requests[0].id;
      }

      if (!requestId) {
        alert('Please create a blood request first from "Post Request" so donors know the patient and hospital context.');
        setContactModalDonor(null);
        return;
      }

      const res = await api.sendContactRequest(requestId, contactModalDonor.id, outreachMessage);
      if (res.success) {
        setOutreachSuccess(`Contact alert sent safely to ${contactModalDonor.displayName}. Donor notified in-app.`);
        setTimeout(() => {
          setOutreachSuccess('');
          setContactModalDonor(null);
          setOutreachMessage('');
        }, 2000);
      } else {
        alert(res.error || 'Unable to dispatch contact request.');
      }
    } catch {
      alert('Failed to send contact request.');
    } finally {
      setOutreachSending(false);
    }
  };

  // Map markers from donors
  const mapMarkers = donors
    .filter((d) => d.approxLatitude != null && d.approxLongitude != null)
    .map((d) => ({
      id: d.id,
      name: d.displayName,
      bloodGroup: d.bloodGroup,
      lat: d.approxLatitude,
      lng: d.approxLongitude,
      city: d.city,
      score: d.rankingScore,
    }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Blood Donors
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search nearby volunteers ranked by ABO compatibility, transit proximity, and freshness.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="inline-flex items-center gap-2 rounded-xl border border-crimson-200 bg-white px-3.5 py-2 text-xs font-bold text-crimson-800 shadow-sm transition hover:bg-crimson-50"
          >
            <Navigation className="w-3.5 h-3.5" />
            Use my location
          </button>
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              List View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-4 h-4 text-crimson-600" />
              Map View
            </button>
          </div>
        </div>
      </div>

      {locationStatus && (
        <p role="status" className="text-xs font-medium text-slate-600">{locationStatus}</p>
      )}

      {/* Filter Bar */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 items-end"
      >
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
          <select
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-crimson-500"
          >
            <option value="ALL">All Groups</option>
            {ALL_BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
          <input
            type="text"
            placeholder="e.g. Bengaluru"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">PIN Code (Optional)</label>
          <input
            type="text"
            placeholder="e.g. 560038"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Radius: {radius} km</label>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value, 10))}
            className="w-full accent-crimson-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-crimson-500"
          >
            <option value="score">AI Match Score</option>
            <option value="distance">Nearest Distance</option>
            <option value="freshness">Recent Confirmation</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full py-2 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            Apply Filters
          </button>
        </div>
      </form>

      {/* Map View Toggle Area */}
      {viewMode === 'map' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <LeafletMap
            markers={mapMarkers}
            centerLat={latitude}
            centerLng={longitude}
            onLocationSelected={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
              setCity('');
              setPincode('');
              fetchDonors({ latitude: lat, longitude: lng, city: '', pincode: '' });
            }}
          />
        </div>
      )}

      {/* Results Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Found <strong>{donors.length}</strong> {bloodGroup === 'ALL' ? 'donor candidates' : 'compatible donors'}
          </span>
          <span className="italic">
            {bloodGroup === 'ALL'
              ? 'Compatibility not assessed — choose a patient blood group to filter'
              : sortBy === 'distance' ? 'Nearest compatible donors first' : 'Prioritized by 4-factor multi-component algorithm'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500 bg-white rounded-2xl border border-slate-200">
            Scanning compatible donors in database...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-700 bg-rose-50 rounded-2xl border border-rose-200 text-sm">
            {error}
          </div>
        ) : donors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Donors Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No registered donors match this exact combination. Try broadening your city filter or increasing the transit radius.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {donors.map((donor) => {
              const score = donor.rankingScore ?? 0;
              const isHigh = score >= 80;

              return (
                <div
                  key={donor.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900">{donor.displayName}</h3>
                          {donor.isVerified && (
                            <span className="p-0.5 bg-blue-50 text-blue-600 rounded-full" title="Verified User">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{donor.locality ? `${donor.locality}, ` : ''}{donor.city}</span>
                          {donor.approximateDistanceKm != null && (
                            <span className="font-semibold text-rose-600">
                              (~{donor.approximateDistanceKm} km)
                            </span>
                          )}
                        </p>
                      </div>

                      <BloodBadge group={donor.bloodGroup} size="md" />
                    </div>

                    {/* Status & Freshness Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          donor.isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${donor.isAvailable ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {donor.isAvailable ? 'Available' : 'Unavailable'}
                      </span>

                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Confirmed {new Date(donor.lastConfirmedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* AI Score Capsule */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-crimson-600" />
                        <div>
                          <span className="text-xs font-bold text-slate-800">
                            Match Score: <span className={isHigh ? 'text-emerald-600' : 'text-amber-600'}>{score}</span>/100
                          </span>
                          <span className="text-[10px] text-slate-400 block -mt-0.5">
                            {donor.compatibilityType === 'UNASSESSED'
                              ? 'Compatibility not assessed'
                              : donor.compatibilityType === 'EXACT' ? 'Exact Blood Group Match' : 'Compatible Secondary'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedDonorForScore(donor)}
                        className="text-[11px] font-bold text-crimson-700 hover:text-crimson-900 underline transition"
                      >
                        Explain Score
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setContactModalDonor(donor)}
                      className="flex-1 py-2 px-3 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Request Contact
                    </button>
                    <button
                      onClick={() => setSelectedDonorForScore(donor)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                      title="View AI Breakdown"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Explainability Breakdown Modal */}
      {selectedDonorForScore && (
        <ScoreBreakdownModal
          isOpen={!!selectedDonorForScore}
          onClose={() => setSelectedDonorForScore(null)}
          donorName={selectedDonorForScore.displayName}
          bloodGroup={selectedDonorForScore.bloodGroup}
          totalScore={selectedDonorForScore.rankingScore}
          compatibilityType={selectedDonorForScore.compatibilityType}
          breakdown={selectedDonorForScore.rankingExplanation}
          summaryText={selectedDonorForScore.explanationSummary}
          medicalNotice={selectedDonorForScore.medicalNotice}
        />
      )}

      {/* Safe Contact Outreach Modal */}
      {contactModalDonor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Safe Contact Request
              </h3>
              <button
                onClick={() => setContactModalDonor(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-center gap-2 font-bold text-slate-800 mb-1">
                <span>Candidate: {contactModalDonor.displayName}</span>
                <BloodBadge group={contactModalDonor.bloodGroup} size="sm" />
              </div>
              <p>
                To respect privacy and DPDP requirements, your outreach will be delivered securely
                through LifeLink notifications without exposing personal phone numbers or exact addresses.
              </p>
            </div>

            {outreachSuccess ? (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                {outreachSuccess}
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message to Volunteer (Non-Sensitive)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Urgent blood requirement for patient at Victoria Hospital. Can you please confirm if you can donate?"
                    value={outreachMessage}
                    onChange={(e) => setOutreachMessage(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-1 focus:ring-crimson-500"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setContactModalDonor(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={outreachSending}
                    className="px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {outreachSending ? 'Sending...' : 'Send Outreach'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
