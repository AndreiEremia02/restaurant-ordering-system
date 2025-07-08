import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { TEXTS } from '../assets/data/texts';
import '../assets/styles/Statistics.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'https://smashly-backend.onrender.com';

export default function Statistics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({});
  const [range, setRange] = useState('zile');

  useEffect(() => {
    axios.get(`${API_BASE}/api/stats`)
      .then(res => setData(res.data))
      .catch(() => setData({}));
  }, []);

  const hourlyData = Object.entries(data.hourlyTotals || {}).map(([ora, valoare]) => ({
    ora: `${ora}:00`,
    incasari: valoare
  }));

  const dailyData = Object.entries(data.dailyTotals || {}).map(([zi, valoare]) => ({
    eticheta: zi,
    incasari: valoare
  }));

  const monthlyData = Object.entries(data.monthlyTotals || {}).map(([luna, valoare]) => ({
    eticheta: luna,
    incasari: valoare
  }));

  const topProducts = data.topProducts || [];
  const graficeZilnice = range === 'zile' ? dailyData.slice(-30) : monthlyData.slice(-12);

  return (
    <div className="statistics-page py-5">
      <div className="statistics-header">
        <button
          className="orders-link-btn"
          onClick={() => navigate(`/employee/${id}`)}
        >
          {TEXTS.STATISTICS.ACTIVE_ORDERS_BUTTON || "COMENZI ACTIVE"}
        </button>
      </div>

      <div className="statistics-card shadow-lg p-4 mb-5 bg-white rounded-5 mx-auto">
        <div className="text-center mb-4">
          <span className="statistics-title text-box-shadow">{TEXTS.STATISTICS.TITLE_HOURLY}</span>
        </div>
        <div className="statistics-chart-wrapper">
          <div style={{ width: "100%", minWidth: 340, overflowX: "auto" }}>
            <ResponsiveContainer width="100%" height={410}>
              <BarChart
                data={hourlyData}
                margin={{ top: 40, right: 30, left: 10, bottom: 20 }}
                barCategoryGap="15%"
                barSize={48}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ora" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="incasari" fill="#007bff" radius={[15, 15, 0, 0]}>
                  <LabelList dataKey="incasari" position="insideTop" fill="#fff" fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="statistics-card shadow-lg p-4 bg-white rounded-5 mx-auto">
        <div className="text-center mb-3">
          <span className="statistics-title text-box-shadow">{TEXTS.STATISTICS.TITLE_TOP_PRODUCTS}</span>
        </div>
        <div className="table-responsive">
          <table className="table table-bordered table-striped statistics-table">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>{TEXTS.STATISTICS.PRODUS}</th>
                <th>{TEXTS.STATISTICS.CANTITATE}</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((prod, index) => (
                <tr key={prod.name}>
                  <td>{index + 1}</td>
                  <td>{prod.name}</td>
                  <td>{prod.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!topProducts.length && (
            <div className="text-center mt-2">{TEXTS.STATISTICS.NU_SUNT_PRODUSE}</div>
          )}
        </div>
      </div>

      <div className="statistics-card shadow-lg p-4 mb-5 bg-white rounded-5 mx-auto">
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-3">
          <div className="text-center w-100 mb-2">
            <span className="statistics-title text-box-shadow">
              {range === 'zile' ? TEXTS.STATISTICS.TITLE_LAST_30 : TEXTS.STATISTICS.TITLE_LAST_12}
            </span>
          </div>
          <div className="statistics-toggle-group">
            <button
              className={`statistics-toggle-btn${range === 'zile' ? ' active' : ''}`}
              onClick={() => setRange('zile')}
              aria-label="Afiseaza pe zile"
            >Zile</button>
            <button
              className={`statistics-toggle-btn${range === 'luni' ? ' active' : ''}`}
              onClick={() => setRange('luni')}
              aria-label="Afiseaza pe luni"
            >Luni</button>
          </div>
        </div>
        <div className="statistics-chart-wrapper">
          <div style={{ width: "100%", minWidth: 340, overflowX: "auto" }}>
            <ResponsiveContainer width="100%" height={440}>
              <BarChart
                data={graficeZilnice}
                margin={{ top: 40, right: 30, left: 10, bottom: 70 }}
                barCategoryGap="10%"
                barSize={38}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="eticheta"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={70}
                  tick={{ fontSize: 12, fill: "#222" }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="incasari" fill="#28a745" radius={[10, 10, 0, 0]}>
                  <LabelList dataKey="incasari" position="insideTop" fill="#fff" fontWeight={600} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
