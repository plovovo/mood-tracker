import { useState, useEffect } from 'react';
import './App.css';
import SupportBot from './components/SupportBot';

const formatLocalDate = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function MoodTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [page, setPage] = useState('mood');
  const pages = ['mood', 'anxiety', 'movies', 'sleep'];
  const currentPageIndex = pages.indexOf(page);

  const [moods, setMoods] = useState(() => JSON.parse(localStorage.getItem('moods')) || {});
  const [anxieties, setAnxieties] = useState(() => JSON.parse(localStorage.getItem('anxieties')) || {});
  const [movies, setMovies] = useState(() => JSON.parse(localStorage.getItem('movies')) || []);
  const [sleepData, setSleepData] = useState(() => JSON.parse(localStorage.getItem('sleepData')) || {});
  const [newMovieTitle, setNewMovieTitle] = useState('');

  useEffect(() => localStorage.setItem('moods', JSON.stringify(moods)), [moods]);
  useEffect(() => localStorage.setItem('anxieties', JSON.stringify(anxieties)), [anxieties]);
  useEffect(() => localStorage.setItem('movies', JSON.stringify(movies)), [movies]);
  useEffect(() => localStorage.setItem('sleepData', JSON.stringify(sleepData)), [sleepData]);

  const todayKey = formatLocalDate(new Date());
  const selectedKey = formatLocalDate(selectedDate);
  const isTodaySelected = selectedKey === todayKey;

  const anxietyLabels = ['None', 'Mild', 'Moderate', 'High', 'Strong'];
  const sleepRatings = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

  const handleSleepChange = (field, value) => {
    const dateKey = formatLocalDate(selectedDate);
    setSleepData({
      ...sleepData,
      [dateKey]: {
        ...(sleepData[dateKey] || {}),
        [field]: value,
      },
    });
  };

  const renderSleepPage = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dateKey = formatLocalDate(selectedDate);
    const entry = sleepData[dateKey] || {};

    return (
      <>
        <div className="page-title-bar">
          <h1 className="fantasy-text">Sleep Tracker</h1>
        </div>
        <div className="sleep-inputs">
          <label>
            Sleep Time:
            <input type="time" value={entry.sleepTime || ''} onChange={(e) => handleSleepChange('sleepTime', e.target.value)} />
          </label>
          <label>
            Wake Time:
            <input type="time" value={entry.wakeTime || ''} onChange={(e) => handleSleepChange('wakeTime', e.target.value)} />
          </label>
          <label>
            Sleep Quality:
            <select value={entry.quality || ''} onChange={(e) => handleSleepChange('quality', e.target.value)}>
              <option value="">-- Select --</option>
              {sleepRatings.map((q, i) => (
                <option key={i} value={q}>{q}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="linear-month-grid">
          <div className="days-row">
            {Array.from({ length: daysInMonth }, (_, i) => {
              const dateObj = new Date(year, month, i + 1);
              const key = formatLocalDate(dateObj);
              const data = sleepData[key];
              const isToday = key === todayKey;
              return (
                <div
                  key={i}
                  className={`calendar-cell${isToday ? ' today' : ''}`}
                  style={{ backgroundColor: data?.quality ? `rgba(255,255,255,${(sleepRatings.indexOf(data.quality) + 1) / 5})` : '#eee' }}
                  onClick={() => setSelectedDate(dateObj)}
                  title={data?.quality ? `${data.quality} sleep` : 'No data'}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  const handleSelect = (value) => {
    const dateKey = formatLocalDate(selectedDate);
    if (dateKey !== todayKey) return;
    page === 'mood' ? setMoods({ ...moods, [dateKey]: value }) : setAnxieties({ ...anxieties, [dateKey]: value });
  };

  const renderButtons = () => {
    if (page === 'mood') {
      return [1, 2, 3, 4, 5].map((val) => (
        <button
          key={val}
          className={`star-button ${getValue() === val ? 'selected' : ''}`}
          onClick={() => handleSelect(val)}
          disabled={!isTodaySelected}
        >
          {val}
        </button>
      ));
    } else {
      return anxietyLabels.map((label, i) => (
        <button
          key={label}
          className={`star-button ${getValue() === i + 1 ? 'selected' : ''}`}
          onClick={() => handleSelect(i + 1)}
          disabled={!isTodaySelected}
        >
          {label}
        </button>
      ));
    }
  };

  const renderLinearYearGrid = () => {
    const year = selectedDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i);

    return (
      <div className="linear-year-grid">
        <div className="month-headers">
          <div className="month-header-placeholder"></div>
          {months.map((month) => (
            <div key={month} className="month-header fantasy-text">
              {new Date(year, month).toLocaleString('default', { month: 'short' })}
            </div>
          ))}
        </div>
        <div className="days-rows">
          {Array.from({ length: 31 }, (_, dayIndex) => (
            <div key={dayIndex} className="day-row">
              <div className="day-label fantasy-text">{dayIndex + 1}</div>
              {months.map((month) => {
                const dateObj = new Date(year, month, dayIndex + 1);
                if (dateObj.getMonth() !== month) return <div key={month} className="calendar-cell empty"></div>;
                const dateKey = formatLocalDate(dateObj);
                const value = page === 'mood' ? moods[dateKey] : anxieties[dateKey];
                const bgColor = getColor(value);
                const isToday = dateKey === todayKey;
                const isFuture = dateKey > todayKey;
                return (
                  <div
                    key={month}
                    className={`calendar-cell${isToday ? ' today' : ''}${isFuture ? ' future' : ''}`}
                    style={{ backgroundColor: bgColor }}
                    title={`${dateKey}${value ? `: ${value}` : ''}`}
                    onClick={() => {
                      if (dateKey <= todayKey) setSelectedDate(dateObj);
                    }}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getValue = () => {
    const dateKey = formatLocalDate(selectedDate);
    return page === 'mood' ? moods[dateKey] : anxieties[dateKey];
  };

  const renderFeedback = () => {
    const dateKey = formatLocalDate(selectedDate);
    const value = getValue();
    const label = page === 'mood'
      ? `${value} star${value > 1 ? 's' : ''}`
      : anxietyLabels[value - 1];
    return value
      ? <p className="feedback-text">You had {page === 'mood' ? label : label.toLowerCase() + ' anxiety'} on {dateKey}.</p>
      : <p className="feedback-text">No data for {dateKey}.</p>;
  };

  const getColor = (value) => {
    const moodColors = ['#eee', '#FFD93D', '#FFA552', '#F59FB0', '#5BC0EB', '#016FB9'];
    const anxietyColors = ['#eee', '#EDFBD4', '#D9F2B4', '#A7D88C', '#65A86F', '#3E7C59'];
    return page === 'mood' ? moodColors[value] || '#eee' : anxietyColors[value] || '#eee';
  };

  const goToPage = (index) => {
    if (index >= 0 && index < pages.length) {
      setPage(pages[index]);
    }
  };

  return (
    <div className="container">
      <div className="arrow-nav">
        {currentPageIndex > 0 && <button onClick={() => goToPage(currentPageIndex - 1)} className="arrow">⬅</button>}
        {currentPageIndex < pages.length - 1 && <button onClick={() => goToPage(currentPageIndex + 1)} className="arrow">➡</button>}
      </div>

      <div className="top-nav fancy-tabs">
        <span onClick={() => setPage('mood')} className={`fantasy-text tab ${page === 'mood' ? 'active' : ''}`}>Mood</span>
        <span className="divider fantasy-text">|</span>
        <span onClick={() => setPage('anxiety')} className={`fantasy-text tab ${page === 'anxiety' ? 'active' : ''}`}>Anxiety</span>
        <span className="divider fantasy-text">|</span>
        <span onClick={() => setPage('movies')} className={`fantasy-text tab ${page === 'movies' ? 'active' : ''}`}>Movies</span>
        <span className="divider fantasy-text">|</span>
        <span onClick={() => setPage('sleep')} className={`fantasy-text tab ${page === 'sleep' ? 'active' : ''}`}>Sleep</span>
      </div>

      {page === 'movies' ? (
        renderMoviePage()
      ) : page === 'sleep' ? (
        renderSleepPage()
      ) : (
        <>
          <div className="page-title-bar">
            <h1 className="fantasy-text">{page === 'mood' ? 'Mood Tracker' : 'Anxiety Tracker'}</h1>
          </div>
          <div className="stars-container">{renderButtons()}</div>
          <h2 className="month-title fantasy-text">{selectedDate.getFullYear()}</h2>
          <div className="calendar-with-feedback">
            {renderLinearYearGrid()}
            <div className="feedback-box">{renderFeedback()}</div>
          </div>
        </>
      )}

      <SupportBot />
    </div>
  );
}