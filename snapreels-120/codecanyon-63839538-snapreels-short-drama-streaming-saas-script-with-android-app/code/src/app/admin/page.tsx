import { MongoClient } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { obfuscateEmail } from '@/lib/demo-mode';
import { subDays, startOfDay, endOfDay, parseISO, eachDayOfInterval, format } from 'date-fns';
import { DashboardClient } from '@/components/admin/dashboard-client';
import type { AdminDashboardData, TopSeriesData, DailyStat } from '@/lib/types';
import { Suspense } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const dynamic = 'force-dynamic';

type AdminDashboardPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function getDashboardData(
  dateRange: { from: Date; to: Date }
): Promise<AdminDashboardData> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set.');
  }
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db();

    // Parallelize all queries for performance
    const [
      newUsersCount,
      totalUsersCount,
      revenueData,
      totalSeriesCount,
      totalEpisodesCount,
      seriesViewsData,
      activeSubscriptionsCount,
      topSeriesDocs,
      topEarningSeriesDocs,
      dailyUsers,
      dailyRevenue,
      recentPurchases,
      recentUsers,
      genreData,
      coinEconomyData,
      watchTimeStats,
      // 10 NEW REAL WIDGETS
      totalPurchasesCount,
      totalCoinSpendCount,
      topCoinPacksData,
      latestEpisodesData,
      totalWatchHistoryRecords,
      topGenresByViewsData,
      recentSeriesData,
      adminCount,
      bannedUsersCount,
      vipUsersCount
    ] = await Promise.all([
      db.collection('users').countDocuments({ createdAt: { $gte: dateRange.from, $lte: dateRange.to } }),
      db.collection('users').countDocuments(),
      db.collection('purchases').aggregate([
        { $match: { createdAt: { $gte: dateRange.from, $lte: dateRange.to } } },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]).toArray(),
      db.collection('series').countDocuments(),
      db.collection('episodes').countDocuments(),
      db.collection('series').aggregate([{ $group: { _id: null, totalViews: { $sum: '$views' } } }]).toArray(),
      db.collection('purchases').distinct('userId', { createdAt: { $gte: dateRange.from, $lte: dateRange.to } }).then(arr => arr.length),
      db.collection('series').find({}).sort({ views: -1 }).limit(10).toArray(),
      // Top Favorited Series Aggregation
      db.collection('favorites').aggregate([
          { $match: { favoritedAt: { $gte: dateRange.from, $lte: dateRange.to } } },
          { $group: { _id: "$seriesId", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
              $lookup: {
                  from: 'series',
                  let: { sId: { $toObjectId: "$_id" } },
                  pipeline: [
                      { $match: { $expr: { $eq: ["$_id", "$$sId"] } } }
                  ],
                  as: 'seriesData'
              }
          },
          { $unwind: "$seriesData" }
      ]).toArray(),
      db.collection('users').aggregate([
          { $match: { createdAt: { $gte: dateRange.from, $lte: dateRange.to } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } }
      ]).toArray(),
      db.collection('purchases').aggregate([
          { $match: { createdAt: { $gte: dateRange.from, $lte: dateRange.to } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$price" } } }
      ]).toArray(),
      db.collection('purchases').find().sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('users').find().sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('series').aggregate([
          { $unwind: "$genres" },
          { $group: { _id: "$genres", value: { $sum: 1 } } },
          { $sort: { value: -1 } },
          { $limit: 5 }
      ]).toArray(),
      db.collection('coinTransactions').aggregate([
          { $group: { _id: "$type", total: { $sum: "$amount" } } }
      ]).toArray(),
      // Mock watch time since it's hard to aggregate exact hours without history duration
      db.collection('watchHistory').aggregate([
          { $match: { watchedAt: { $gte: dateRange.from, $lte: dateRange.to } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$watchedAt" } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
      ]).toArray(),
      // NEW WIDGET QUERIES
      db.collection('purchases').countDocuments({ createdAt: { $gte: dateRange.from, $lte: dateRange.to } }),
      db.collection('coinTransactions').countDocuments({ type: 'spend', createdAt: { $gte: dateRange.from, $lte: dateRange.to } }),
      db.collection('purchases').aggregate([{ $group: { _id: "$packName", value: { $sum: 1 } } }]).toArray(),
      db.collection('episodes').find().sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('watchHistory').countDocuments(),
      db.collection('series').aggregate([
          { $unwind: "$genres" },
          { $group: { _id: "$genres", value: { $sum: "$views" } } },
          { $sort: { value: -1 } },
          { $limit: 5 }
      ]).toArray(),
      db.collection('series').find().sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('users').countDocuments({ role: 'admin' }),
      db.collection('users').countDocuments({ isBanned: true }),
      // Real VIP Users Count
      db.collection('users').countDocuments({ isVip: true })
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const totalViews = seriesViewsData[0]?.totalViews || 0;
    const arpu = activeSubscriptionsCount > 0 ? totalRevenue / activeSubscriptionsCount : 0;
    const engagementRate = totalUsersCount > 0 ? (newUsersCount / totalUsersCount) * 100 : 0; 
    const avgSessionDuration = 0;
    
    // NEW WIDGET VARIABLES
    const averagePurchaseValue = totalPurchasesCount > 0 ? totalRevenue / totalPurchasesCount : 0;

    const topPerformingSeries: TopSeriesData[] = topSeriesDocs.map((s: any) => ({
        id: s._id.toString(),
        title: s.title,
        views: s.views || 0,
        revenue: 0,
    }));

    const topFavoritedSeriesData = topEarningSeriesDocs.map((s: any) => ({
        id: s.seriesData._id.toString(),
        title: s.seriesData.title,
        views: s.seriesData.views || 0,
        favoritesCount: s.count
    }));

    const interval = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const dailyStats: DailyStat[] = interval.map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        const userCount = dailyUsers.find(d => d._id === dateStr)?.count || 0;
        const revenueAmount = dailyRevenue.find(d => d._id === dateStr)?.total || 0;
        return {
            date: format(date, "MMM dd"),
            registrations: userCount,
            revenue: revenueAmount
        };
    });

    const watchTimeStatsMapped = interval.map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        const wCount = watchTimeStats.find(w => w._id === dateStr)?.count || 0;
        return {
            date: format(date, "MMM dd"),
            hours: (wCount * 15) / 60, // Assuming avg 15 mins per watch history item
        };
    });

    const recentPurchasesFormatted = recentPurchases.map((p: any) => ({
        id: p._id.toString(),
        userEmail: obfuscateEmail(p.userEmail),
        packName: p.packName,
        price: p.price,
        createdAt: p.createdAt
    }));

    const recentUsersFormatted = recentUsers.map((u: any) => ({
        id: u._id.toString(),
        email: obfuscateEmail(u.email),
        displayName: u.displayName,
        createdAt: u.createdAt
    }));
    
    const latestEpisodes = latestEpisodesData.map((e: any) => ({
        id: e._id.toString(),
        title: e.title,
        seriesId: e.seriesId?.toString(),
        createdAt: e.createdAt
    }));

    const recentSeries = recentSeriesData.map((s: any) => ({
        id: s._id.toString(),
        title: s.title,
        views: s.views || 0,
        createdAt: s.createdAt
    }));

    const genreDistribution = genreData.map((g: any) => ({
        name: g._id,
        value: g.value
    }));
    
    const topCoinPacks = topCoinPacksData.map((p: any) => ({
        name: p._id || 'Unknown',
        value: p.value
    }));

    const topGenresByViews = topGenresByViewsData.map((g: any) => ({
        name: g._id,
        value: g.value
    }));

    const platformBreakdown = [
        { name: 'VIP Users', value: vipUsersCount || 0 },
        { name: 'Free Users', value: (totalUsersCount - (vipUsersCount || 0)) }
    ];

    const coinCirculating = coinEconomyData.find(c => c._id === 'purchase')?.total || 0;
    const coinSpent = coinEconomyData.find(c => c._id === 'spend')?.total || 0;

    const systemHealth = [
        { name: 'MongoDB Cluster', status: 'operational' as const },
        { name: 'Firebase Auth', status: 'operational' as const },
        { name: 'Media Storage CDN', status: 'operational' as const },
        { name: 'AI Node Engine', status: 'operational' as const }
    ];

    return {
      totalRevenue,
      newUsersCount,
      totalUsersCount,
      totalSeriesCount,
      totalEpisodesCount,
      totalViews,
      activeSubscriptions: activeSubscriptionsCount,
      avgSessionDuration,
      arpu,
      engagementRate,
      topPerformingSeries,
      topFavoritedSeries: topFavoritedSeriesData,
      dailyStats,
      recentPurchases: recentPurchasesFormatted,
      recentUsers: recentUsersFormatted,
      systemHealth,
      genreDistribution,
      platformBreakdown,
      coinEconomy: { circulating: coinCirculating, spent: coinSpent },
      watchTimeStats: watchTimeStatsMapped,
      // NEW
      totalPurchasesCount,
      totalCoinSpendCount,
      averagePurchaseValue,
      topCoinPacks,
      latestEpisodes,
      totalWatchHistoryRecords,
      topGenresByViews,
      recentSeries,
      adminCount,
      bannedUsersCount
    };
  } catch (error) {
    console.error('Failed to fetch dashboard data from MongoDB:', error);
    return {
      totalRevenue: 0, newUsersCount: 0, totalUsersCount: 0, totalSeriesCount: 0,
      totalEpisodesCount: 0, totalViews: 0, activeSubscriptions: 0, avgSessionDuration: 0,
      arpu: 0, engagementRate: 0, topPerformingSeries: [], topFavoritedSeries: [],
      dailyStats: [], recentPurchases: [], recentUsers: [], systemHealth: [],
      genreDistribution: [], platformBreakdown: [], coinEconomy: { circulating: 0, spent: 0 },
      watchTimeStats: [],
      totalPurchasesCount: 0, totalCoinSpendCount: 0, averagePurchaseValue: 0,
      topCoinPacks: [], latestEpisodes: [], totalWatchHistoryRecords: 0,
      topGenresByViews: [], recentSeries: [], adminCount: 0, bannedUsersCount: 0
    };
  } finally {
    await client.close();
  }
}

function DashboardSkeleton() {
    return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
            <Skeleton className="h-9 w-72" />
            <Skeleton className="h-4 w-80 mt-2" />
        </div>
        <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-[490px]" />
        </div>
      </div>
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="p-6"><Skeleton className="h-5 w-32 mb-2" /><Skeleton className="h-8 w-24" /></Card>
            <Card className="p-6"><Skeleton className="h-5 w-24 mb-2" /><Skeleton className="h-8 w-16" /></Card>
            <Card className="p-6"><Skeleton className="h-5 w-24 mb-2" /><Skeleton className="h-8 w-16" /></Card>
            <Card className="p-6"><Skeleton className="h-5 w-28 mb-2" /><Skeleton className="h-8 w-16" /></Card>
            <Card className="p-6"><Skeleton className="h-5 w-32 mb-2" /><Skeleton className="h-8 w-16" /></Card>
      </div>
    </div>
    )
}

async function DashboardDataFetcher({ dateRange }: { dateRange: { from: Date; to: Date }}) {
    const data = await getDashboardData(dateRange);
    return <DashboardClient initialData={data} dateRange={dateRange} />;
}


export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const params = await searchParams;
  const fromStr = typeof params.from === 'string' ? params.from : null;
  const toStr = typeof params.to === 'string' ? params.to : null;

  const from = fromStr ? startOfDay(parseISO(fromStr)) : startOfDay(subDays(new Date(), 29));
  const to = toStr ? endOfDay(parseISO(toStr)) : endOfDay(new Date());
  const dateRange = { from, to };

  return (
    <Suspense fallback={<DashboardSkeleton />}>
        <DashboardDataFetcher dateRange={dateRange} />
    </Suspense>
  );
}

