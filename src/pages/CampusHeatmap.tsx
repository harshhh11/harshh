import Layout from "@/components/layout/Layout";
import { CampusHeatmap as HeatmapComponent } from "@/components/heatmap/CampusHeatmap";

const CampusHeatmapPage = () => {
  return (
    <Layout>
      <div className="container py-8">
        <HeatmapComponent />
      </div>
    </Layout>
  );
};

export default CampusHeatmapPage;
