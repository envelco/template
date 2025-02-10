import "./App.css"
import * as Query from "@tanstack/react-query"
import React from "react"

const queryClient = new Query.QueryClient()
const ENVEL_API_ENDPOINT = import.meta.env.VITE_ENVEL_API_ENDPOINT

function App() {
  return (
    <Query.QueryClientProvider client={queryClient}>
      <EnvelApp />
    </Query.QueryClientProvider>
  )
}

export default App

function EnvelApp() {
  const [timeRange, setTimeRange] = React.useState({
    value: "all",
    label: "All Time",
    filter: "",
  })

  const fetchData = async (query) => {
    const response = await fetch(`${ENVEL_API_ENDPOINT}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    })
    const data = await response.json()
    return data.values
  }

  // Queries
  const { data: metrics } = Query.useQuery({
    queryKey: ["metrics", timeRange.value],
    queryFn: async () => {
      const response = await fetch(`${ENVEL_API_ENDPOINT}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            SELECT
              COUNT(*) as total_orders,
              SUM(CAST(REPLACE(REPLACE(price, '€', ''), ',', '.') AS DECIMAL(10,2))) as total_revenue,
              AVG(CAST(REPLACE(REPLACE(price, '€', ''), ',', '.') AS DECIMAL(10,2))) as avg_order_value,
              COUNT(DISTINCT manufacturer) as total_manufacturers
            FROM google_sheets_12G5RuoLRTe54Qy_MY_VjiRutcUppYJE1DazHQ_w0Ffw_0
            ${timeRange.filter}
          `,
        }),
      })
      const data = await response.json()
      return data.values[0]
    },
  })

  const { data: categoryData } = Query.useQuery({
    queryKey: ["categoryData", timeRange.filter],
    queryFn: () =>
      fetchData(`
      SELECT 
        category as label,
        ROUND(SUM(CAST(REPLACE(REPLACE(price, '€', ''), ',', '.') AS DECIMAL(10,2))), 2) as value
      FROM google_sheets_12G5RuoLRTe54Qy_MY_VjiRutcUppYJE1DazHQ_w0Ffw_0
      WHERE category IS NOT NULL${timeRange.filter}
      GROUP BY category
      ORDER BY value DESC
    `),
  })

  const { data: manufacturerData } = Query.useQuery({
    queryKey: ["manufacturerData", timeRange.filter],
    queryFn: () =>
      fetchData(`
      SELECT 
        manufacturer as label,
        ROUND(SUM(CAST(REPLACE(REPLACE(price, '€', ''), ',', '.') AS DECIMAL(10,2))), 2) as value
      FROM google_sheets_12G5RuoLRTe54Qy_MY_VjiRutcUppYJE1DazHQ_w0Ffw_0
      WHERE manufacturer IS NOT NULL${timeRange.filter}
      GROUP BY manufacturer
      ORDER BY value DESC
      LIMIT 5
    `),
  })

  const { data: revenueOverTime } = Query.useQuery({
    queryKey: ["revenueOverTime", timeRange.filter],
    queryFn: () =>
      fetchData(`
      SELECT 
        DATE_TRUNC('month', order_date::date) as label,
        ROUND(SUM(CAST(REPLACE(REPLACE(price, '€', ''), ',', '.') AS DECIMAL(10,2))), 2) as value
      FROM google_sheets_12G5RuoLRTe54Qy_MY_VjiRutcUppYJE1DazHQ_w0Ffw_0
      WHERE order_date IS NOT NULL${timeRange.filter}
      GROUP BY label
      ORDER BY label
    `),
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Sales Dashboard
          </h1>
          <fn-dropdown label={timeRange.label}>
            <fn-dropdown-item
              value="all"
              selected={timeRange.value === "all"}
              onElementClick={() =>
                setTimeRange({
                  value: "all",
                  label: "All Time",
                  filter: "",
                })
              }
            >
              All Time
            </fn-dropdown-item>
            <fn-dropdown-item
              value="ytd"
              selected={timeRange.value === "ytd"}
              onElementClick={() =>
                setTimeRange({
                  value: "ytd",
                  label: "Year to Date",
                  filter:
                    "WHERE order_date::date >= DATE_TRUNC('year', CURRENT_DATE)",
                })
              }
            >
              Year to Date
            </fn-dropdown-item>
            <fn-dropdown-item
              value="90d"
              selected={timeRange.value === "90d"}
              onElementClick={() =>
                setTimeRange({
                  value: "90d",
                  label: "Last 90 Days",
                  filter:
                    "WHERE order_date::date >= CURRENT_DATE - INTERVAL '90 days'",
                })
              }
            >
              Last 90 Days
            </fn-dropdown-item>
          </fn-dropdown>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <fn-card variant="bordered">
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {metrics
                ? new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(metrics.total_revenue)
                : "€0,00"}
            </h2>
          </fn-card>
          <fn-card variant="bordered">
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {metrics
                ? new Intl.NumberFormat("de-DE").format(metrics.total_orders)
                : "0"}
            </h2>
          </fn-card>
          <fn-card variant="bordered">
            <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {metrics
                ? new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(metrics.avg_order_value)
                : "€0,00"}
            </h2>
          </fn-card>
          <fn-card variant="bordered">
            <p className="text-sm font-medium text-gray-500">
              Total Manufacturers
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {metrics ? metrics.total_manufacturers : "0"}
            </h2>
          </fn-card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <fn-card variant="bordered">
            <h3 className="text-lg font-semibold mb-4">Revenue by Category</h3>
            <fn-pie-chart
              data={
                categoryData?.map((item) => ({
                  label: item.label,
                  value: Number(item.value),
                  format: {
                    valueFormat: {
                      style: "currency",
                      currency: "EUR",
                      locale: "de-DE",
                    },
                  },
                })) || []
              }
              maxHeight="300"
              color="#3B82F6"
            />
          </fn-card>
          <fn-card variant="bordered">
            <h3 className="text-lg font-semibold mb-4">
              Top Manufacturers by Revenue
            </h3>
            <fn-bar-chart
              data={[
                {
                  name: "Revenue",
                  color: "#3B82F6",
                  data:
                    manufacturerData?.map((item) => ({
                      label: item.label,
                      value: Number(item.value),
                      format: {
                        valueFormat: {
                          style: "currency",
                          currency: "EUR",
                          locale: "de-DE",
                        },
                      },
                    })) || [],
                },
              ]}
              maxHeight="300"
            />
          </fn-card>
        </div>

        <fn-card variant="bordered">
          <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
          <fn-area-chart
            data={[
              {
                name: "Revenue",
                color: "#3B82F6",
                data:
                  revenueOverTime?.map((item) => ({
                    label: new Date(item.label).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    }),
                    value: Number(item.value),
                    format: {
                      valueFormat: {
                        style: "currency",
                        currency: "EUR",
                        locale: "de-DE",
                      },
                    },
                  })) || [],
              },
            ]}
            maxHeight="400"
          />
        </fn-card>
      </div>
    </div>
  )
}
