"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { clientFetch } from "../../../../lib/clientApi";
import RepoHeader from "../../../../components/RepoHeader";
import LoadingCard from "../../../../components/LoadingCard";
import ErrorCard from "../../../../components/ErrorCard";
import AnalysisSummary from "../../../../components/AnalysisSummary";
import LanguageChart from "../../../../components/LanguageChart";
import ContributorsList from "../../../../components/ContributorsList";
import CommitsChart from "../../../../components/CommitsChart";
import CommitDetails from "../../../../components/CommitDetails";
import ActivityByDayChart from "../../../../components/ActivityByDayChart";
import HourlyChart from "../../../../components/HourlyChart";
import Heatmap from "../../../../components/Heatmap";
import IssuesPrCard from "../../../../components/IssuesPrCard";
import ReleasesList from "../../../../components/ReleasesList";

function emptySection() {
  return { status: "loading", data: null, message: "" };
}

export default function RepoDashboardPage() {
  const params = useParams();
  const owner = params.owner;
  const repo = params.repo;

  const [info, setInfo] = useState(emptySection());
  const [languages, setLanguages] = useState(emptySection());
  const [contributors, setContributors] = useState(emptySection());
  const [commits, setCommits] = useState(emptySection());
  const [issues, setIssues] = useState(emptySection());
  const [pulls, setPulls] = useState(emptySection());
  const [releases, setReleases] = useState(emptySection());

  useEffect(
    function () {
      var base = "/api/repo/" + owner + "/" + repo;

      async function loadOne(path, setter) {
        var result = await clientFetch(path);
        if (result.ok) {
          setter({ status: "ok", data: result.data, message: "" });
        } else {
          setter({
            status: "error",
            data: null,
            message: result.message,
          });
        }
      }

      loadOne(base, setInfo);
      loadOne(base + "/languages", setLanguages);
      loadOne(base + "/contributors", setContributors);
      loadOne(base + "/commits", setCommits);
      loadOne(base + "/issues", setIssues);
      loadOne(base + "/pulls", setPulls);
      loadOne(base + "/releases", setReleases);
    },
    [owner, repo]
  );

  if (info.status === "loading") {
    return <p className="muted">Chargement du dépôt…</p>;
  }

  if (info.status === "error") {
    return (
      <div className="card">
        <p className="error">{info.message}</p>
        <Link href="/" className="button button-secondary">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  var summaryReady =
    info.status === "ok" &&
    (languages.status === "ok" || languages.status === "error") &&
    (contributors.status === "ok" || contributors.status === "error") &&
    (commits.status === "ok" || commits.status === "error");

  return (
    <div>
      <p>
        <Link href="/">← Nouvelle analyse</Link>
      </p>
      <RepoHeader repo={info.data} />

      {summaryReady ? (
        <AnalysisSummary
          repo={info.data}
          languages={languages.status === "ok" ? languages.data : null}
          contributors={
            contributors.status === "ok" ? contributors.data : null
          }
          commits={commits.status === "ok" ? commits.data : null}
        />
      ) : (
        <LoadingCard title="Synthèse détaillée" />
      )}

      <div className="grid grid-2">
        {languages.status === "loading" ? (
          <LoadingCard title="Langages" />
        ) : null}
        {languages.status === "error" ? (
          <ErrorCard title="Langages" message={languages.message} />
        ) : null}
        {languages.status === "ok" ? (
          <LanguageChart
            languages={languages.data.languages}
            totalSizeLabel={languages.data.totalSizeLabel}
            languageCount={languages.data.languageCount}
            dominant={languages.data.dominant}
            source={languages.data.source}
            sourceLabel={languages.data.sourceLabel}
            detected={languages.data.detected}
            note={languages.data.note}
            fileCount={languages.data.fileCount}
            documentationOnly={languages.data.documentationOnly}
            infoMessage={languages.data.infoMessage}
          />
        ) : null}

        {contributors.status === "loading" ? (
          <LoadingCard title="Contributeurs" />
        ) : null}
        {contributors.status === "error" ? (
          <ErrorCard title="Contributeurs" message={contributors.message} />
        ) : null}
        {contributors.status === "ok" ? (
          <ContributorsList
            contributors={contributors.data.contributors}
            totalContributions={contributors.data.totalContributions}
            contributorCount={contributors.data.contributorCount}
          />
        ) : null}

        {commits.status === "loading" ? (
          <LoadingCard title="Commits" />
        ) : null}
        {commits.status === "error" ? (
          <ErrorCard title="Commits" message={commits.message} />
        ) : null}
        {commits.status === "ok" ? (
          <CommitsChart
            timeline={commits.data.timeline}
            total={commits.data.total}
            avgOverSpan={commits.data.avgOverSpan}
            firstDate={commits.data.firstDate}
            lastDate={commits.data.lastDate}
          />
        ) : null}

        {commits.status === "loading" ? (
          <LoadingCard title="Analyse des commits" />
        ) : null}
        {commits.status === "error" ? (
          <ErrorCard title="Analyse des commits" message={commits.message} />
        ) : null}
        {commits.status === "ok" ? (
          <CommitDetails commits={commits.data} />
        ) : null}

        {commits.status === "loading" ? (
          <LoadingCard title="Activité par jour" />
        ) : null}
        {commits.status === "error" ? (
          <ErrorCard title="Activité par jour" message={commits.message} />
        ) : null}
        {commits.status === "ok" ? (
          <ActivityByDayChart byWeekday={commits.data.byWeekday} />
        ) : null}

        {commits.status === "loading" ? (
          <LoadingCard title="Activité par heure" />
        ) : null}
        {commits.status === "error" ? (
          <ErrorCard title="Activité par heure" message={commits.message} />
        ) : null}
        {commits.status === "ok" ? (
          <HourlyChart byHour={commits.data.byHour} />
        ) : null}

        {commits.status === "loading" ? (
          <LoadingCard title="Heatmap" />
        ) : null}
        {commits.status === "error" ? (
          <ErrorCard title="Heatmap" message={commits.message} />
        ) : null}
        {commits.status === "ok" ? (
          <Heatmap heatmap={commits.data.heatmap} />
        ) : null}

        {issues.status === "loading" || pulls.status === "loading" ? (
          <LoadingCard title="Issues et pull requests" />
        ) : null}
        {issues.status === "error" && pulls.status === "error" ? (
          <ErrorCard
            title="Issues et pull requests"
            message={issues.message}
          />
        ) : null}
        {issues.status === "ok" || pulls.status === "ok" ? (
          <IssuesPrCard
            issues={issues.status === "ok" ? issues.data : null}
            pulls={pulls.status === "ok" ? pulls.data : null}
            issuesError={issues.status === "error" ? issues.message : ""}
            pullsError={pulls.status === "error" ? pulls.message : ""}
          />
        ) : null}

        {releases.status === "loading" ? (
          <LoadingCard title="Releases" />
        ) : null}
        {releases.status === "error" ? (
          <ErrorCard title="Releases" message={releases.message} />
        ) : null}
        {releases.status === "ok" ? (
          <ReleasesList releases={releases.data.releases} />
        ) : null}
      </div>
    </div>
  );
}
