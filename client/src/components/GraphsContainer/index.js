import React, { useEffect, useState } from "react";
import { API } from 'aws-amplify'
import SelectorTimming from '../SelectorTiming'
import moment from 'moment'
import './GraphContainer.css'
import Graph from '../commons/graphs'
import formatCash from '../../utils/formatCash';

const GraphContainer = () => {
  const [timeAgo, setTimeAgo] = useState('year');
  const [cardStatsSeries, setCardStatsSeries] = useState([])
  const [cardStatsOptions, setCardStatsOptions] = useState({});
  const [categoryStatsSeries, setCategoryStatsSeries] = useState([])
  const [categoryStatsOptions, setCategoryStatsOptions] = useState({});
  const [incomesvspaymentsSeries, setIncomesVSPaymentsSeries] = useState([])
  const [incomesvspaymentsOptions, setIncomesVSPaymentsOptions] = useState({});
  const [paymentsMontlySeries, setPaymentsMontlySeries] = useState([])
  const [paymentsMontlyOptions, setPaymentsMontlyOptions] = useState({});
  const [categoriesMontlySeries, setCategoriesMontlySeries] = useState([])
  const [categoriesMontlyOptions, setCategoriesMontlyOptions] = useState({});
  const [incomesMontlySeries, setIncomesMontlySeries] = useState([])
  const [incomesMontlyOptions, setIncomesMontlyOptions] = useState({});



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

      setPaymentsMontlySeries([
        {
          name: "Gastos",
          data: paymentsAmount,
        },
      ])

      setPaymentsMontlyOptions({
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
        plotOptions: {
          bar: {
            borderRadius: 10,
            dataLabels: {
              position: 'top',
            },
          }
        },
        xaxis: {
          categories: paymentsMonths,
          axisBorder: {
            show: false
          },
        },
        yaxis: {
          formatter: formatCash
        },
        stroke: {
          curve: "smooth",
          width: 3
        }
      })

      // Incomes vs Payments
      const [incomesAmounts, incomesMonths] = incomes.reduce(
        (prev, current) => {
          prev[0].push(current.total.toFixed(2));
          prev[1].push(current.month);
          return prev;
        },
        [[], []]
      );

      setIncomesVSPaymentsSeries([
        {
          name: "Ingresos",
          data: incomesAmounts,
        },
        {
          name: "Gastos",
          data: paymentsAmount.slice(paymentsMonths.indexOf(incomesMonths[0])),
        },
      ])

      setIncomesVSPaymentsOptions({
        chart: {
          stacked: true,
          stackType: '100%',

        },
        responsive: [{
          breakpoint: 480,
        }],
        plotOptions: {
          bar: {
            horizontal: false,
            borderRadius: 10,
            dataLabels: {
              position: 'top',
            }
          },
        },
        xaxis: {
          categories: incomesMonths,
        },
        legend: {
          position: 'right',
          offsetY: 40
        },
        fill: {
          opacity: 1
        },

        stroke: {
          curve: "smooth",
          width: 3
        },

        dataLabels: {
          enabled: true,
          offsetY: -20,
          style: {
            fontSize: '12px',
            colors: ["#054b80"]
          },
          formatter: (val, opts) => {
            return `${val.toFixed(2)}%`
          }
        },
      })
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

        setCategoriesMontlySeries(fillPayments);
        setCategoriesMontlyOptions({
          xaxis: {
            categories: uniqueMonthsPayments,
            axisBorder: {
              show: false
            },
          },
          yaxis: {
            formatter: formatCash
          },
          stroke: {
            curve: "smooth",
            width: 3
          },
        })

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

        setIncomesMontlySeries(fillIncomes);
        setIncomesMontlyOptions({
          xaxis: {
            categories: uniqueMonthsIncomes,
            axisBorder: {
              show: false
            },
          },
          yaxis: {
            formatter: formatCash
          },
          stroke: {
            curve: "smooth",
            width: 3
          },
        })

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


        setCardStatsSeries(cardTypeStatsSeries);
        setCardStatsOptions({
          chart: {
            width: 400
          },
          labels: cardTypesNamesSeries,
          enabled: true,
          formatter: function (val) {
            return val + "%"
          }
        })


        // CategoryTypeStats
        const { categoriesTypeNamesSeries, categoryTypeSeries } = categoryTypeStats.reduce((prev, item) => {
          prev.categoriesTypeNamesSeries.push(item.cardType)
          prev.categoryTypeSeries.push(parseFloat(item.percent.toFixed(2)))

          return prev
        }, { categoriesTypeNamesSeries: [], categoryTypeSeries: [] })

        setCategoryStatsSeries(categoryTypeSeries);
        setCategoryStatsOptions({
          chart: {
            width: 400
          },
          labels: categoriesTypeNamesSeries,
          enabled: true,
          formatter: function (val) {
            return val + "%"
          }
        })
      })
      .catch((err) => console.error(err));
  }

  const onChangeDate = (e, period) => {
    const date = moment().subtract(1, period).toISOString()
    const groupby = period === 'year'
      ? 'month'
      : 'day';
    getMonthlyCategories(date, groupby)
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
          <Graph series={paymentsMontlySeries} options={paymentsMontlyOptions} width="100%" />
        </div>
        <div className="graph-category-monthly-container">
          <h2>Payments Categories by month</h2>
          <Graph series={categoriesMontlySeries} options={categoriesMontlyOptions} width="100%" type='line' />
        </div>
      </div>

      <div className="container-graphs-general">
        <div className="graph-monthly-container">
          <h2>Total Incomes vs Payments monthly</h2>
          <Graph series={incomesvspaymentsSeries} options={incomesvspaymentsOptions} width="100%" />
        </div>
        <div className="graph-category-monthly-container">
          <h2>Incomes Categories by month</h2>
          <Graph series={incomesMontlySeries} options={incomesMontlyOptions} width="100%" type='line' />
        </div>
      </div>

      <div className="container-graphs-general">
        <div className="ggraph-monthly-container">
          <h2>Percentage By Card Type</h2>
          <Graph series={cardStatsSeries} options={cardStatsOptions} type='donut' />
        </div>
        <div className="graph-category-monthly-container">
          <h2>Percentage by Category</h2>
          <Graph series={categoryStatsSeries} options={categoryStatsOptions} type='donut' />
        </div>
      </div>
    </div>
  );
}

export default GraphContainer;
