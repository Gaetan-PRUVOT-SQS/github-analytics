"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { clientFetch } from "@/lib/clientApi";
import UserHeader from "@/components/UserHeader";
import UserSummary from "@/components/UserSummary";
import UserReposList from "@/components/UserReposList";
import LanguageChart from "@/components/LanguageChart";
import LoadingCard from "@/components/LoadingCard";
import ErrorCard from "@/components/ErrorCard";

function emptySection() {
  return { status: "loading", data: null, message: "" };
}

export default function UserDashboardPage() {
  const params = useParams();
  const username = params.username;

  const [profile, setProfile] = useState(emptySection());
  const [repos, setRepos] = useState(emptySection());

  useEffect(
    function () {
      var base = "/api/user/" + username;

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

      loadOne(base, setProfile);
      loadOne(base + "/repos", setRepos);
    },
    [username]
  );

  if (profile.status === "loading") {
    return <p className="muted">Chargement du compte GitHub…</p>;
  }

  if (profile.status === "error") {
    return (
      <div className="card">
        <p className="error">{profile.message}</p>
        <Link href="/" className="button button-secondary">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p>
        <Link href="/">← Nouvelle analyse</Link>
      </p>

      <UserHeader user={profile.data} />

      {repos.status === "loading" ? (
        <LoadingCard title="Synthèse du compte" />
      ) : null}
      {repos.status === "error" ? (
        <ErrorCard title="Synthèse du compte" message={repos.message} />
      ) : null}
      {repos.status === "ok" ? <UserSummary stats={repos.data} /> : null}

      <div className="grid grid-2">
        {repos.status === "loading" ? (
          <LoadingCard title="Langages (par dépôts)" />
        ) : null}
        {repos.status === "error" ? (
          <ErrorCard title="Langages" message={repos.message} />
        ) : null}
        {repos.status === "ok" && repos.data.languagesByRepos ? (
          <LanguageChart
            languages={repos.data.languagesByRepos.languages}
            totalSizeLabel={
              repos.data.languagesByRepos.totalSizeLabel + " dépôt(s)"
            }
            languageCount={repos.data.languagesByRepos.languageCount}
            dominant={repos.data.languagesByRepos.dominant}
            source="user-repos"
            sourceLabel="Langage principal de chaque dépôt"
            detected={repos.data.languagesByRepos.detected}
            note="Répartition selon le langage principal annoncé par GitHub pour chaque dépôt."
            documentationOnly={false}
          />
        ) : null}

        {repos.status === "ok" && repos.data.languagesByStars ? (
          <LanguageChart
            languages={repos.data.languagesByStars.languages}
            totalSizeLabel={
              String(repos.data.totalStars) + " star(s) cumulées"
            }
            languageCount={repos.data.languagesByStars.languageCount}
            dominant={repos.data.languagesByStars.dominant}
            source="user-stars"
            sourceLabel="Langages pondérés par les stars"
            detected={repos.data.languagesByStars.detected}
            note="Chaque dépôt compte ses stars dans son langage principal."
            documentationOnly={false}
          />
        ) : null}
      </div>

      {repos.status === "loading" ? (
        <LoadingCard title="Top dépôts" />
      ) : null}
      {repos.status === "ok" ? (
        <UserReposList
          title="Top dépôts par stars"
          repos={repos.data.topByStars}
        />
      ) : null}
      {repos.status === "ok" ? (
        <UserReposList
          title="Dépôts récemment mis à jour"
          repos={repos.data.topRecent}
        />
      ) : null}
      {repos.status === "ok" ? (
        <UserReposList
          title="Tous les dépôts analysés"
          repos={repos.data.allRepos}
        />
      ) : null}
    </div>
  );
}
