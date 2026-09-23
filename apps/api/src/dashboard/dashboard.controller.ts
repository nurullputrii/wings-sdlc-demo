import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * US-2: dashboard summary. Returns stubbed metrics until real data
 * integrations land (see docs/prd.md — Non-Goals).
 */
@Controller('dashboard')
@UseGuards(AuthGuard('jwt'))
export class DashboardController {
  @Get('summary')
  getSummary() {
    return {
      generatedAt: new Date().toISOString(),
      cards: [
        {
          key: 'totalUsers',
          label: 'Total Users',
          value: 1284,
          trend: '+4.2% vs last week',
        },
        {
          key: 'activeProjects',
          label: 'Active Projects',
          value: 37,
          trend: '+2 this month',
        },
        {
          key: 'deployments',
          label: 'Deployments',
          value: 112,
          trend: 'last 30 days',
        },
        {
          key: 'openIssues',
          label: 'Open Issues',
          value: 9,
          trend: '-3 vs last week',
        },
        {
          key: 'uptime',
          label: 'Platform Uptime',
          value: 99.95,
          trend: 'last 30 days (%)',
        },
      ],
    };
  }
}
