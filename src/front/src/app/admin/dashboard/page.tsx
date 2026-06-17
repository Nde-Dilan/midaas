"use client";

import { useAuthStore } from "@/store/auth";
import { useAdminStore } from "@/store/admin";
import { useCompanyStore } from "@/store/company";
import { useCampaignsStore } from "@/store/campaigns";
import { ModalNames, useModalStore } from "@/store/modal";
import OnboardingBanner from "@/components/molecules/onboarding-banner";
import useGetCampaigns from "@/hooks/useCampaigns";
import useGetCompanies from "@/hooks/useCompanies";
import { Button } from "@/components/atoms/button";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Layers,
  TrendingUp,
  Plus,
  Eye,
  Briefcase,
  Target,
  Users,
  ArrowRight,
  Search,
  ExternalLink,
  Shield,
  Clock,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { adminProvider } from "@/api/admin";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const {
    pendingCompanies,
    entrepreneurs,
    users,
    pendingProjects,
    setPendingCompanies,
    setEntrepreneurs,
    setUsers,
    setPendingProjects,
  } = useAdminStore();
  const { companies, count: companyCount } = useCompanyStore();
  const { campaigns, count: campaignCount } = useCampaignsStore();
  const { openModal } = useModalStore();

  // Load data
  useGetCampaigns({ page: 1 });
  useGetCompanies();

  const isAdmin = user?.role === "admin";
  const isEntrepreneur = user?.isEntrepreneur ?? false;
  const entrepreneurStatus = user?.entrepreneurStatus;
  const isPendingEntrepreneur = entrepreneurStatus === "pending";
  const isActiveEntrepreneur =
    isEntrepreneur && entrepreneurStatus === "active";

  // Stats calculations
  const totalFundingRaised = campaigns.reduce(
    (sum, c) => sum + c.fundingRaised,
    0,
  );
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  // Load admin dashboard data
  useEffect(() => {
    if (!isAdmin) return;

    if (pendingCompanies.length === 0) {
      adminProvider.getPendingCompanies().then(({ data }) => {
        if (data) setPendingCompanies(data);
      });
    }
    if (entrepreneurs.length === 0) {
      adminProvider.getEntrepreneurs().then(({ data }) => {
        if (data) setEntrepreneurs(data);
      });
    }
    if (users.length === 0) {
      adminProvider.getUsers().then(({ data }) => {
        if (data) setUsers(data);
      });
    }
    if (pendingProjects.length === 0) {
      adminProvider.getPendingProjects().then(({ data }) => {
        if (data) setPendingProjects(data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const handleAddCompany = () => {
    openModal({ name: ModalNames.ADD_COMPANY });
  };

  const handleAddCampaign = () => {
    openModal({ name: ModalNames.ADD_CAMPAIGN });
  };

  // ─── Admin Dashboard ───────────────────────────────────────────
  const pendingCount = pendingCompanies.length;
  const pendingReviewCount = pendingCompanies.filter(
    (c) => c.status === "pending" || c.status === "reverify_requested",
  ).length;
  const entrepreneursCount = entrepreneurs.length;
  const usersCount = users.length;

  if (isAdmin) {
    return (
      <section className="p-6">
        <div className="max-w-[1400px] mx-auto mt-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-MontserratBold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage companies, entrepreneurs and platform users
              </p>
            </div>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/admin/companies/pending">
              <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    En attente de validation
                  </p>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{pendingReviewCount}</p>
              </div>
            </Link>

            <Link href="/admin/campaigns/pending">
              <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Pending Campaigns</p>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {pendingProjects.length}
                </p>
              </div>
            </Link>

            <Link href="/admin/companies/pending">
              <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Total Companies</p>
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{pendingCount}</p>
              </div>
            </Link>

            <Link href="/admin/entrepreneurs">
              <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Entrepreneurs</p>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{entrepreneursCount}</p>
              </div>
            </Link>

            <Link href="/admin/users">
              <div className="bg-white rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Users</p>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{usersCount}</p>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link href="/admin/companies/pending">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-MontserratSemiBold text-gray-900">
                      Review Companies
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {pendingReviewCount > 0
                        ? `${pendingReviewCount} company(ies) pending`
                        : "None pending"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/campaigns/pending">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-MontserratSemiBold text-gray-900">
                      Review Campaigns
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {pendingProjects.length > 0
                        ? `${pendingProjects.length} campaign(s) pending`
                        : "None pending"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/entrepreneurs">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-MontserratSemiBold text-gray-900">
                      Manage Entrepreneurs
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {entrepreneursCount} entrepreneur(s) inscrit(s)
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/users">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-MontserratSemiBold text-gray-900">
                      View Users
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {usersCount} utilisateur(s) inscrit(s)
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent pending companies */}
          {pendingCompanies.length > 0 && (
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <div>
                  <h3 className="text-lg font-MontserratBold text-gray-900">
                    Latest Pending Requests
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Companies awaiting your review
                  </p>
                </div>
                <Link href="/admin/companies/pending">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="divide-y divide-border">
                {pendingCompanies.slice(0, 5).map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center border border-border">
                        <Building2 className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {company.trade_name || company.legal_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {company.corporate_form}
                          {company.entrepreneur?.user?.full_name
                            ? ` · ${company.entrepreneur.user.full_name}`
                            : ""}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        company.status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {company.status === "pending"
                        ? "Pending"
                        : "Re-vérification"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // ─── Entrepreneur Pending Banner ───────────────────────────────
  if (isPendingEntrepreneur) {
    return (
      <section className="p-6">
        <div className="max-w-[1400px] mx-auto mt-8 space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-amber-200 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-MontserratBold text-gray-900 mb-2">
              Demande en cours de validation
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Votre demande de passage en mode entrepreneur a été soumise avec
              succès. Un administrateur va vérifier vos informations sous peu.
              Vous recevrez une notification dès que votre statut sera actif.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="p-6">
      <div className="max-w-[1400px] mx-auto mt-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-MontserratBold text-gray-900">
              Tableau de bord
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isAdmin
                ? "Midaas Platform Administration"
                : isActiveEntrepreneur
                  ? "Gérez vos entreprises et campagnes de financement"
                  : "Explorez les opportunités d'investissement"}
            </p>
          </div>
          {isActiveEntrepreneur && (
            <div className="flex gap-3">
              <Button
                onClick={handleAddCompany}
                variant="outline"
                className="gap-2"
              >
                <Building2 className="w-4 h-4" />
                Nouvelle entreprise
              </Button>
              <Button onClick={handleAddCampaign} className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle campagne
              </Button>
            </div>
          )}
        </div>

        {/* Onboarding Banner - only for users without role selection */}
        {!isEntrepreneur && !isPendingEntrepreneur && <OnboardingBanner />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isActiveEntrepreneur ? (
            <>
              {/* Entrepreneur Stats */}
              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Mes entreprises</p>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{companyCount}</p>
              </div>

              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Mes campagnes</p>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{campaignCount}</p>
              </div>

              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Campagnes actives</p>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{activeCampaigns}</p>
              </div>

              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Total collecté</p>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Target className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {totalFundingRaised.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">XOF</p>
              </div>
            </>
          ) : (
            <>
              {/* Investor Stats */}
              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Projets disponibles</p>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{campaignCount}</p>
              </div>

              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Montant total levé</p>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">
                  {totalFundingRaised.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">XOF</p>
              </div>

              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Projets actifs</p>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">{activeCampaigns}</p>
              </div>

              <div className="bg-white rounded-xl border border-border p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Investisseurs</p>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                <p className="text-2xl font-bold mt-2">-</p>
              </div>
            </>
          )}
        </div>

        {/* ─── Entrepreneur: Companies Section ──────────────────── */}
        {isActiveEntrepreneur && (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <h3 className="text-lg font-MontserratBold text-gray-900">
                  Mes entreprises
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Gérez les entreprises liées à vos campagnes
                </p>
              </div>
              <Button onClick={handleAddCompany} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>

            {companies.length > 0 ? (
              <div className="divide-y divide-border">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {company.displayName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {company.corporateForm} ·{" "}
                          {company.industrySector || "Non spécifié"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${company.statusColor}`}
                      >
                        {company.statusLabel}
                      </span>
                      <Link href={`/admin/companies/${company.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <Building2 className="w-12 h-12 text-gray-300" />
                  <p className="text-gray-500 font-medium">
                    Aucune entreprise créée
                  </p>
                  <p className="text-gray-400 text-sm">
                    Créez votre première entreprise pour commencer à lancer des
                    campagnes
                  </p>
                  <Button onClick={handleAddCompany} className="mt-2 gap-2">
                    <Plus className="w-4 h-4" />
                    Créer une entreprise
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Recent Campaigns (Both Roles) ────────────────────── */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-lg font-MontserratBold text-gray-900">
                {isActiveEntrepreneur
                  ? "Mes campagnes récentes"
                  : "Campagnes récentes"}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {isActiveEntrepreneur
                  ? "Aperçu de vos dernières campagnes"
                  : "Découvrez les dernières opportunités"}
              </p>
            </div>
            <Link
              href={
                isActiveEntrepreneur ? "/admin/my-campaigns" : "/admin/projects"
              }
            >
              <Button variant="ghost" size="sm" className="gap-1">
                View all
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {campaigns.length > 0 ? (
            <div className="divide-y divide-border">
              {campaigns.slice(0, 5).map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {campaign.coverImageUrl ? (
                        <img
                          src={campaign.coverImageUrl}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Layers className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {campaign.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {campaign.category || "Non catégorisé"} ·{" "}
                        {campaign.fundingGoal.toLocaleString()}{" "}
                        {campaign.currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden sm:flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            campaign.progressPercentage >= 100
                              ? "bg-emerald-500"
                              : campaign.progressPercentage >= 50
                                ? "bg-blue-500"
                                : "bg-amber-500"
                          }`}
                          style={{ width: `${campaign.progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-500 w-8">
                        {campaign.progressPercentage}%
                      </span>
                    </div>

                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${campaign.statusColor}`}
                    >
                      {campaign.statusLabel}
                    </span>

                    {!isActiveEntrepreneur && (
                      <Link href={`/admin/projects/${campaign.id}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center gap-3">
                <Search className="w-12 h-12 text-gray-300" />
                <p className="text-gray-500 font-medium">
                  {isActiveEntrepreneur
                    ? "Aucune campagne créée"
                    : "Aucune campagne disponible"}
                </p>
                <p className="text-gray-400 text-sm">
                  {isActiveEntrepreneur
                    ? "Créez votre première campagne après avoir enregistré une entreprise"
                    : "Revenez plus tard pour découvrir les nouveaux projets"}
                </p>
                {isActiveEntrepreneur && (
                  <Button onClick={handleAddCampaign} className="mt-2 gap-2">
                    <Plus className="w-4 h-4" />
                    Nouvelle campagne
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Investor: CTA to Explore ─────────────────────────── */}
        {!isActiveEntrepreneur &&
          !isPendingEntrepreneur &&
          campaignCount > 0 && (
            <div className="bg-gradient-to-br from-[#5E0E08] to-[#7A1A12] rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-xl font-MontserratBold">
                    Prêt à investir ?
                  </h3>
                  <p className="text-white/80 mt-1 max-w-lg text-sm">
                    Explorez les projets disponibles et trouvez celui qui
                    correspond à vos objectifs d&apos;investissement.
                  </p>
                </div>
                <Link href="/admin/projects">
                  <Button className="bg-white text-[#5E0E08] hover:bg-gray-100 gap-2 min-w-[180px]">
                    Explorer les projets
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
