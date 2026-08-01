import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { VanueRoutes } from '../app/modules/vanue/vanue.route';
import { ProgrammesRoutes } from '../app/modules/programmes/programmes.route';
import { RecommendationsRoutes } from '../app/modules/recommendations/recommendations.route';
import { EventRoutes } from '../app/modules/event/event.route';
import { BookingRoutes } from '../app/modules/booking/booking.route';
import { PackageRoutes } from '../app/modules/package/package.route';
import { SubscriptionRoutes } from '../app/modules/subscription/subscription.route';
import { AddonRoutes } from '../app/modules/addon/addon.route';
import { NotificationRoutes } from '../app/modules/notification/notification.routes';
import { ActivityRoutes } from '../app/modules/activity/activity.route';
import { AdRoutes } from '../app/modules/ad/ad.route';
import { DashboardRoutes } from '../app/modules/dashboard/dashboard.route';
import { TransactionRoutes } from '../app/modules/transaction/transaction.route';
import { TicketRoutes } from '../app/modules/ticket/ticket.route';
import { ArtistRoutes } from '../app/modules/artist/artist.route';
import { FaqRoutes } from '../app/modules/faq/faq.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/vanue',
    route: VanueRoutes,
  },
  {
    path: '/programmes',
    route: ProgrammesRoutes,
  },
  {
    path: '/recommendations',
    route: RecommendationsRoutes,
  },
  {
    path: '/event',
    route: EventRoutes,
  },
  {
    path:"/booking",
    route:BookingRoutes
  },
  {
    path:"/package",
    route:PackageRoutes
  },
  {
    path:"/subscription",
    route:SubscriptionRoutes
  },
  {
    path:"/addon",
    route:AddonRoutes
  },
  {
    path:"/notification",
    route:NotificationRoutes
  },
  {
    path: '/activity',
    route:ActivityRoutes ,
  },
  {
    path: '/ads',
    route:AdRoutes ,
  },
  {
    path: '/dashboard',
    route:DashboardRoutes
  },
  {
    path:"/transaction",
    route:TransactionRoutes
  },
  {
    path:"/ticket",
    route:TicketRoutes
  },
  {
    path:"/artist",
    route:ArtistRoutes
  },
  {
    path:"/faq",
    route:FaqRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
