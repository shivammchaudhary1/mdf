"use client";
import Link from "next/link";

import { AdminIcon } from "@/components/admin/admin-icons";
import { AdminStatus } from "@/components/admin/admin-shared";

import { useAdminDashboard } from "./use-admin-dashboard";

export function AdminDashboardView() {
  const data = useAdminDashboard();
  return (
    <div className="ad-stack">
      <section className="ad-dashboard-hero">
        <div>
          <p className="ad-kicker">Platform overview</p>
          <h1>Everything that needs your attention, in one place.</h1>
          <span>Review talent, applications, projects and public content without losing sight of the bigger picture.</span>
        </div>
        <div className="ad-hero-actions">
          <Link href="/admin/casting" className="ad-primary-link">
            Create Casting Call →
          </Link>
          <Link href="/admin/projects" className="ad-secondary-link">
            Manage Projects
          </Link>
        </div>
      </section>

      <section className="ad-stat-grid">
        {data.stats.map((s) => (
          <article key={s.label} className="ad-stat-card">
            <div className="ad-stat-icon">
              <AdminIcon name={s.icon} />
            </div>
            <div>
              <p>{s.label}</p>
              <strong>{s.value}</strong>
              <span className={`ad-delta ${s.tone}`}>{s.delta}</span>
              <small>{s.helper}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="ad-dashboard-grid">
        <div className="ad-dashboard-main">
          <article className="ad-card">
            <div className="ad-card-head">
              <div>
                <p className="ad-kicker">Application pipeline</p>
                <h2>Current Casting Funnel</h2>
              </div>
              <Link href="/admin/applications">Review applications →</Link>
            </div>
            <div className="ad-pipeline">
              {data.pipeline.map((x) => (
                <div key={x.label}>
                  <div>
                    <span>{x.label}</span>
                    <strong>{x.value}</strong>
                  </div>
                  <div className="ad-pipeline-bar">
                    <i style={{ width: `${x.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>
          <article className="ad-card">
            <div className="ad-card-head">
              <div>
                <p className="ad-kicker">Growth</p>
                <h2>Member Growth</h2>
              </div>
              <span>Last 6 months</span>
            </div>
            <div className="ad-growth-chart">
              {data.growth.map((x) => (
                <div key={x.label}>
                  <div className="ad-growth-bar">
                    <i style={{ height: `${x.value}%` }} />
                  </div>
                  <span>{x.label}</span>
                </div>
              ))}
            </div>
          </article>
          <article className="ad-card">
            <div className="ad-card-head">
              <div>
                <p className="ad-kicker">Recent activity</p>
                <h2>Platform Activity</h2>
              </div>
            </div>
            <div className="ad-activity-list">
              {data.recentActivity.map((x) => (
                <div key={`${x.title}-${x.time}`}>
                  <span className="ad-activity-icon">
                    <AdminIcon
                      name={
                        x.type === "member"
                          ? "members"
                          : x.type === "project"
                            ? "projects"
                            : x.type === "contact"
                              ? "contacts"
                              : x.type === "content"
                                ? "blog"
                                : "applications"
                      }
                    />
                  </span>
                  <div>
                    <strong>{x.title}</strong>
                    <p>{x.meta}</p>
                  </div>
                  <time>{x.time}</time>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="ad-dashboard-side">
          <article className="ad-card ad-queue-card">
            <div className="ad-card-head">
              <div>
                <p className="ad-kicker">Needs attention</p>
                <h2>Review Queue</h2>
              </div>
            </div>
            <Link href="/admin/applications">
              <span>Pending applications</span>
              <strong>{data.queue.pending}</strong>
            </Link>
            <Link href="/admin/members">
              <span>Profiles awaiting verification</span>
              <strong>{data.queue.unverified}</strong>
            </Link>
            <Link href="/admin/contacts">
              <span>New contact queries</span>
              <strong>{data.queue.contacts}</strong>
            </Link>
            <Link href="/admin/blog">
              <span>Draft posts</span>
              <strong>{data.queue.drafts}</strong>
            </Link>
          </article>
          <article className="ad-card">
            <div className="ad-card-head">
              <div>
                <p className="ad-kicker">Quick actions</p>
                <h2>Create</h2>
              </div>
            </div>
            <div className="ad-quick-actions">
              <Link href="/admin/projects">+ New Project</Link>
              <Link href="/admin/casting">+ New Casting Call</Link>
              <Link href="/admin/blog">+ New Blog Post</Link>
              <Link href="/admin/team">+ Add Team Member</Link>
            </div>
          </article>
          <article className="ad-card">
            <div className="ad-card-head">
              <div>
                <p className="ad-kicker">Latest applications</p>
                <h2>Fresh Submissions</h2>
              </div>
              <Link href="/admin/applications">All →</Link>
            </div>
            <div className="ad-mini-apps">
              {data.applications.slice(0, 3).map((a) => (
                <div key={a.id}>
                  <div className="ad-mini-avatar">{a.applicant[0]}</div>
                  <div>
                    <strong>{a.applicant}</strong>
                    <span>
                      {a.role} · {a.project}
                    </span>
                  </div>
                  <AdminStatus value={a.status} />
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}
