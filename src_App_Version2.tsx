import React, { useEffect, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

// --- GLOBAL STYLES FOR TV (Montserrat/Inter, background, etc.)
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Montserrat:700,800,400|Inter:700,400&display=swap');
  body {
    margin: 0;
    background: #1c3144;
    font-family: 'Montserrat', 'Inter', Arial, sans-serif;
    color: #fff;
    overflow: hidden;
  }
`;

// --- STYLED COMPONENTS FOR LAYOUT AND COLORS ---
const Container = styled.div`
  width: 100vw; height: 100vh;
  display: flex; flex-direction: column;
  justify-content: space-between;
  padding: 32px 48px 24px 48px;
  box-sizing: border-box;
`;

const Header = styled.div`
  display: flex; align-items: flex-start; justify-content: space-between;
`;

const TruckIcon = styled.div`
  width: 64px; height: 48px;
  background: url('data:image/svg+xml;utf8,<svg width="64" height="48" fill="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 6.5A2.5 2.5 0 0 1 4.5 4H15a2.5 2.5 0 0 1 2.5 2.5V8h2.31a1.5 1.5 0 0 1 1.37.83l1.61 3.22c.13.25.21.54.21.83v4.12A1.5 1.5 0 0 1 21.5 18H21a2 2 0 1 1-4 0h-6a2 2 0 1 1-4 0H4.5A2.5 2.5 0 0 1 2 15.5v-9Zm2.5-.5A.5.5 0 0 0 4 6.5v9a.5.5 0 0 0 .5.5H5a2 2 0 1 1 4 0h6a2 2 0 1 1 4 0h.5a.5.5 0 0 0 .5-.5v-4.12a.5.5 0 0 0-.07-.25l-1.61-3.22A.5.5 0 0 0 19.81 8H17V6.5a.5.5 0 0 0-.5-.5H4.5ZM7 18a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm10 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"/></svg>') no-repeat center/contain;
`;

const MainNumber = styled.div`
  font-size: 96px;
  font-weight: 800;
  letter-spacing: -3px;
  color: #fff;
  text-align: center;
  flex: 1;
`;

const LastUpdated = styled.div`
  font-size: 20px; text-align: right;
  color: #e0e5eb;
  > span { display: block; font-size: 38px; font-weight: 700; color: #fff; }
`;

const KPIRow = styled.div`
  display: flex; gap: 24px; margin: 32px 0 0 0;
`;

const KPIBox = styled.div<{ kpiColor: string }>`
  background: ${({ kpiColor }) => kpiColor};
  flex: 1; min-width: 0;
  border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 28px 0 18px 0;
`;

const KPIValue = styled.div<{ big?: boolean }>`
  font-size: ${({ big }) => (big ? "48px" : "32px")};
  font-weight: 800;
  color: #fff;
  margin-top: 4px;
`;

const KPIName = styled.div`
  font-size: 22px; font-weight: 600; color: #fff; letter-spacing: 1px;
`;

const BarChartBox = styled.div`
  background: #243951; border-radius: 12px; flex: 1.1; padding: 18px 18px 18px 18px;
  display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
`;

const ChartTitle = styled.div`
  font-size: 20px; font-weight: 600; color: #fff; margin-bottom: 18px;
`;

const ChartBars = styled.div`
  width: 100%; display: flex; flex-direction: column; gap: 18px;
`;

const ChartBar = styled.div<{ color: string; width: number }>`
  height: 22px; border-radius: 8px;
  background: ${({ color }) => color};
  width: ${({ width }) => width}%;
  margin-left: 6px;
  transition: width 0.5s;
`;

const ChartLabels = styled.div`
  font-size: 14px; color: #dbe9f6;
  display: flex; justify-content: space-between; margin-top: 12px;
`;

const TableSection = styled.div`
  background: #223146; border-radius: 14px;
  margin: 32px 0 0 0;
  padding: 18px 24px;
`;

const TableHeader = styled.div`
  display: flex; font-size: 18px; font-weight: 600; border-bottom: 1px solid #395077; padding-bottom: 8px;
`;

const TableRow = styled.div`
  display: flex; font-size: 17px; font-weight: 500; border-bottom: 1px solid #2e425b;
  padding: 6px 0;
  &:last-child { border-bottom: none; }
`;

const Col = styled.div<{ flex?: number }>`
  flex: ${({ flex }) => flex || 1};
  min-width: 0;
`;

const Footer = styled.div`
  display: flex; justify-content: space-between; margin-top: 8px;
  font-size: 18px; color: #c7d4e3; letter-spacing: 1px;
`;

// --- GOOGLE SHEETS FETCHING LOGIC ---
async function fetchSheetData(sheetId: string, sheetName: string): Promise<any> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=AIzaSyB_hsL7DIB1P7yxxqOVM6sk7Gf2eaX0GLc`;
  const response = await fetch(url);
  const data = await response.json();
  return data.values;
}

// --- MAIN TV DASHBOARD COMPONENT ---
const SHEET_ID = "1Vi6OIZ_VkTGBXJXwdcHJXwCBk_lwC315g17qp0-Xr-Y";
const SHEET_NAME = "Dashboard_Data";

function getRegionColor(idx: number) {
  if (idx === 2) return "#ffaa3b";
  if (idx === 3) return "#ed6a5e";
  return "#219472";
}

const App: React.FC = () => {
  const [tableRows, setTableRows] = useState<any[]>([]);
  const [pending, setPending] = useState<number[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [mainNumber, setMainNumber] = useState<string>("0");
  const [date, setDate] = useState<string>(new Date().toLocaleDateString());
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const rows = await fetchSheetData(SHEET_ID, SHEET_NAME);
        setRegions(rows.slice(1, 8).map((r: any) => r[0]));
        setPending(rows.slice(1, 8).map((r: any) => Number(r[1] || 0)));
        setLastUpdated(rows[1][3] || "");
        setMainNumber(rows[0][5] || "0");
        setTableRows(rows.slice(1, 8));
        setDate(new Date().toLocaleDateString());
        setSyncError(null);
      } catch (e: any) {
        setSyncError("Error syncing with Google Sheets");
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const barMax = Math.max(...pending, 12000);
  const barData = pending
    .map((val, idx) => ({
      region: regions[idx],
      value: val,
      color: getRegionColor(idx)
    }))
    .filter((d, i) => i < 3);

  return (
    <>
      <GlobalStyle />
      <Container>
        <Header>
          <TruckIcon />
          <MainNumber>{mainNumber}</MainNumber>
          <LastUpdated>
            Last updated
            <span>{lastUpdated || "--:--"}</span>
          </LastUpdated>
        </Header>
        <KPIRow>
          {regions.slice(0, 4).map((reg, idx) => (
            <KPIBox key={reg} kpiColor={getRegionColor(idx)}>
              <KPIName>{reg}</KPIName>
              <KPIValue big>{pending[idx] || 0}</KPIValue>
            </KPIBox>
          ))}
          <BarChartBox>
            <ChartTitle>Pending</ChartTitle>
            <ChartBars>
              {barData.map((bar, i) => (
                <ChartBar
                  key={bar.region}
                  color={bar.color}
                  width={Math.round((bar.value / barMax) * 100)}
                  title={bar.region}
                />
              ))}
            </ChartBars>
            <ChartLabels>
              <span>0K</span>
              <span>4K</span>
              <span>6K</span>
              <span>12K</span>
            </ChartLabels>
          </BarChartBox>
        </KPIRow>
        <TableSection>
          <TableHeader>
            <Col flex={1.6}>Region</Col>
            <Col flex={1}>Pending</Col>
            <Col flex={2}>Top Contributor</Col>
          </TableHeader>
          {tableRows.map((row, idx) => (
            <TableRow key={row[0] || idx}>
              <Col flex={1.6}>{row[0]}</Col>
              <Col flex={1}>{row[1]}</Col>
              <Col flex={2}>{row[2]}</Col>
            </TableRow>
          ))}
        </TableSection>
        <Footer>
          <span>{date}</span>
          <span>Updates every 5 min</span>
        </Footer>
        {syncError && (
          <div style={{ color: "red", position: "absolute", bottom: 5, left: 20 }}>
            {syncError}
          </div>
        )}
      </Container>
    </>
  );
};

export default App;