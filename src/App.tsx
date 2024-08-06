import './App.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import CryptoSummary from './components/CryptoSummary';
import { Crypto } from './types/Types';
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import type { ChartData } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [cryptos, setCryptos] = useState<Crypto[] | null>(null);
  const [selected, setSelected] = useState<Crypto[]>([]);
  const [data, setData] = useState<ChartData<'pie'>>();
  useEffect(() => {
    const url =
      'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false';
    axios.get(url).then((response) => {
      setCryptos(response.data);
    });
  }, []);

  useEffect(() => {
    console.log('selected:', selected);
    if (selected.length === 0) return;
    setData({
      labels: selected.map((s) => s.name),
      datasets: [
        {
          label: '# of Votes',
          data: selected.map((s) => s.owned * s.current_price),
          backgroundColor: [
            'rgba(255, 10, 10, 0.2)',
            'rgba(10, 10, 255, 0.2)',
            'rgba(10, 255, 10, 0.2)',
          ],
          borderColor: [
            'rgba(255, 10, 10, 0.2)',
            'rgba(10, 10, 255, 0.2)',
            'rgba(10, 255, 10, 0.2)',
          ],
          borderWidth: 1,
        },
      ],
    });
  }, [selected]);

  function updateOwned(crypto: Crypto, amount: number): void {
    console.log('updateOwned', crypto, amount);
    let temp = [...selected];
    let tempObj = temp.find((c) => c.id === crypto.id);
    if (tempObj) {
      tempObj.owned = amount;
      setSelected(temp);
    }
  }
  return (
    <>
      <div className="App">
        <select
          onChange={(e) => {
            const c = cryptos?.find((x) => x.id === e.target.value) as Crypto;
            setSelected([...selected, c]);
          }}
          defaultValue="default">
          <option value="default">Choose an option</option>
          {cryptos
            ? cryptos.map((crypto) => {
                return (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name}
                  </option>
                );
              })
            : null}
        </select>
      </div>

      {selected.map((s) => {
        return <CryptoSummary crypto={s} updateOwned={updateOwned} />;
      })}

      {data ? (
        <div style={{ width: 600 }}>
          <Pie data={data} />
        </div>
      ) : null}
      {selected
        ? 'Your portfolio is worth: $' +
          selected
            .map((s) => {
              if (isNaN(s.owned)) {
                return 0;
              }
              return s.current_price * s.owned;
            })
            .reduce((prev, current) => {
              return prev + current;
            }, 0)
            .toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
        : null}
    </>
  );
}

export default App;
