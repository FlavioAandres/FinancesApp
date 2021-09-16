import React, { useEffect, useState } from "react";
import ApexCharts from "apexcharts";
import { API } from 'aws-amplify'
import SelectorTimming from '../SelectorTiming'
import moment from 'moment'
import './GraphContainer.css'
import formatCash from '../../utils/formatCash';

const GraphContainer = () => {
  const [timeAgo, setTimeAgo] = useState('year');
  const ChartsRendered = {}

  const renderGraph = ({ type = "bar", series, categories = [], xaxis = {}, dataLabels = {}, plotOptions = {}, chartOptions = {} }, id) => {
    const basics = {
      chart: {
        type,
        ...chartOptions
      },
    };
    if (!ChartsRendered[id]) {
      let chart;
      switch (type) {
        case 'donut':
          chart = new ApexCharts(document.getElementById(id), {
            ...basics,
            series,
            enabled: true,
            formatter: function (val) {
              return val + "%"
            },
            labels: dataLabels,
            plotOptions
          });
          break;

        default:
          chart = new ApexCharts(document.getElementById(id), {
            ...basics,
            series,
            xaxis: {
              categories,
              axisBorder: {
                show: false
              },
              ...xaxis
            },
            yaxis: {
              formatter: formatCash
            },
            dataLabels,
            plotOptions,
            stroke: {
              curve: "smooth",
              width: 3
            },
          });
          break;
      }
      chart.render();
      ChartsRendered[id] = chart;
    } else {
      ChartsRendered[id].updateSeries(series)
      switch (type) {
        case 'donut':
          ChartsRendered[id].updateOptions({
            labels: dataLabels
          })
          break;
        default:
          break;
      }
    }

  }

  const getMonthlyMetrics = () =>
    API.get("finances", '/boxflow/stats').then(response => {
      const { payments, incomes } = JSON.parse(response.body)

      // Payments
      const [paymentsAmount, paymentsMonths] = payments.reduce(
        (prev, current) => {
          prev[0].push(current.total.toFixed(2));
          prev[1].push(current.month);
          return prev;
        },
        [[], []]
      );

      renderGraph(
        {
          categories: paymentsMonths,
          series: [
            {
              name: "Gastos",
              data: paymentsAmount,
            },
          ],
          plotOptions: {
            bar: {
              borderRadius: 10,
              dataLabels: {
                position: 'top',
              },
            }
          },
          dataLabels: {
            enabled: true,
            formatter: function (val) {
              return formatCash(val).replace(',00', '')
            },
            offsetY: -20,
            style: {
              fontSize: '12px',
              colors: ["#054b80"]
            }
          },
        },
        "graph-montly"
      );

      // Incomes vs Payments
      const [incomesAmounts, incomesMonths] = incomes.reduce(
        (prev, current) => {
          prev[0].push(current.total.toFixed(2));
          prev[1].push(current.month);
          return prev;
        },
        [[], []]
      );

      renderGraph(
        {
          categories: incomesMonths,
          series: [
            {
              name: "Ingresos",
              data: incomesAmounts,
            },
            {
              name: "Gastos",
              data: paymentsAmount.slice(paymentsMonths.indexOf(incomesMonths[0])),
            },
          ],
          plotOptions: {
            bar: {
              borderRadius: 10,
              dataLabels: {
                position: 'top',
              },
            }
          },
          chartOptions: {
            stacked: true,
            stackType: '100%'
          },
          dataLabels: {
            enabled: true,
            offsetY: -20,
            style: {
              fontSize: '12px',
              colors: ["#054b80"]
            }
          },
        },
        "graph-montly-incomes-vs-payemnts"
      );
    });

  const getMonthlyCategories = (date, period = 'month') => {
    
    API.get('finances', '/boxflow/stats', { queryStringParameters: { metricType: 'category', date, groupBy: period } })
      .then((res) => {
        const { payments, incomes } = JSON.parse(res.body);

        // Payments
        const monthsArray = [];
        const datasetsPayemnts = payments.map((item) => {
          return {
            name: item.category,
            data: item.monthly.map((i) => {
              const date = period !== 'month'
                ? i.month.substring(5, 10)
                : i.month
              monthsArray.push(date);
              return {
                x: date,
                y: i.total.toFixed(2),
              };
            }),
          };
        });
        const uniqueMonthsPayments = [...new Set(monthsArray)].sort();
        const fillPayments = datasetsPayemnts.map((serie) => {
          const existentMonth = serie.data.map((i) => i.x);
          const filled = uniqueMonthsPayments
            .map((month) => {
              if (!existentMonth.includes(month)) {
                return {
                  x: month,
                  y: 0,
                };
              }
            })
            .filter((i) => i);
          const joined = [...filled, ...serie.data].sort((a, b) => {
            if (a.x > b.x) return 1;
            if (a.x < b.x) return -1;
            return 0;
          });
          return {
            ...serie,
            data: joined,
          };
        });

        renderGraph(
          {
            categories: uniqueMonthsPayments,
            type: "line",
            series: fillPayments,
          },
          "graph-category-monthly"
        );

        // Incomes
        const monthsArrayIncomes = [];
        const datasetsIncomes = incomes.map((item) => {
          return {
            name: item.category,
            data: item.monthly.map((i) => {
              const date = period !== 'month'
                ? i.month.substring(5, 10)
                : i.month
              monthsArrayIncomes.push(date);
              return {
                x: date,
                y: i.total.toFixed(2),
              };
            }),
          };
        });
        const uniqueMonthsIncomes = [...new Set(monthsArrayIncomes)].sort();
        const fillIncomes = datasetsIncomes.map((serie) => {
          const existentMonth = serie.data.map((i) => i.x);
          const filled = uniqueMonthsIncomes
            .map((month) => {
              if (!existentMonth.includes(month)) {
                return {
                  x: month,
                  y: 0,
                };
              }
            })
            .filter((i) => i);
          const joined = [...filled, ...serie.data].sort((a, b) => {
            if (a.x > b.x) return 1;
            if (a.x < b.x) return -1;
            return 0;
          });
          return {
            ...serie,
            data: joined,
          };
        });

        renderGraph(
          {
            categories: uniqueMonthsIncomes,
            type: "line",
            series: fillIncomes,
          },
          "graph-category-monthly-incomes"
        );
      })
      .catch((err) => console.error(err));
  }

  const getStats = (date) => {
    API.get('finances', '/boxflow/stats', { queryStringParameters: { metricType: 'stats', date } })
      .then((res) => {
        const { cardTypeStats, categoryTypeStats } = JSON.parse(res.body);

        // CardTypeStats

        const { cardTypesNamesSeries, cardTypeStatsSeries } = cardTypeStats.reduce((prev, item) => {
          prev.cardTypesNamesSeries.push(item.cardType)
          prev.cardTypeStatsSeries.push(parseFloat(item.percent.toFixed(2)))

          return prev
        }, { cardTypesNamesSeries: [], cardTypeStatsSeries: [] })


        renderGraph(
          {
            dataLabels: cardTypesNamesSeries,
            type: "donut",
            series: cardTypeStatsSeries,
            chartOptions: { width: 400 }
          },
          "graph-card-stats"
        );

        // CategoryTypeStats
        const { categoriesTypeNamesSeries, categoryTypeSeries } = categoryTypeStats.reduce((prev, item) => {
          prev.categoriesTypeNamesSeries.push(item.cardType)
          prev.categoryTypeSeries.push(parseFloat(item.percent.toFixed(2)))

          return prev
        }, { categoriesTypeNamesSeries: [], categoryTypeSeries: [] })

        renderGraph(
          {
            dataLabels: categoriesTypeNamesSeries,
            type: "donut",
            series: categoryTypeSeries,
            chartOptions: { width: 500 }
          },
          "graph-category-stats"
        );
      })
      .catch((err) => console.error(err));
  }

  const onChangeDate = (e, period) => {
    const date = moment().subtract(1, period).toISOString()
    const grpupBy = period === 'year'
      ? 'month'
      : 'day';
    getMonthlyCategories(date, grpupBy)
    getStats(date);
    setTimeAgo(period)
  }

  useEffect(() => {
    getMonthlyMetrics();
    getMonthlyCategories();
    getStats();
  }, []);

  return (
    <div className="graph-container">
      <SelectorTimming
        onChangeDate={onChangeDate}
        timeAgo={timeAgo}
      />
      <div className="container-graphs-general">
        <div className="graph-monthly-container">
          <h2>Total monthly payemnts</h2>
          <div id="graph-montly"></div>
        </div>
        <div className="graph-category-monthly-container">
          <h2>Payments Categories by month</h2>
          <div id="graph-category-monthly"></div>
        </div>
      </div>

      <div className="container-graphs-general">
        <div className="graph-monthly-container">
          <h2>Total Incomes vs Payments monthly</h2>
          <div id="graph-montly-incomes-vs-payemnts"></div>
        </div>
        <div className="graph-category-monthly-container">
          <h2>Incomes Categories by month</h2>
          <div id="graph-category-monthly-incomes"></div>
        </div>
      </div>

      <div className="container-graphs-general">
        <div className="ggraph-monthly-container">
          <h2>Percentage By Card Type</h2>
          <div id="graph-card-stats"></div>
        </div>
        <div className="graph-category-monthly-container">
          <h2>Percentage by Category</h2>
          <div id="graph-category-stats"></div>
        </div>
      </div>
    </div>
  );
}

export default GraphContainer;
