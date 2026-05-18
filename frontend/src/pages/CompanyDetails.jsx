import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  ExternalLink,
  Globe,
  MapPin
} from 'lucide-react';
import companyService from '../services/companyService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { getOptimizedCloudinaryUrl } from '../utils/cloudinary';
import { setDocumentMeta } from '../utils/documentMeta';

function CompanyDetails() {
  const { id } = useParams();
  const [companyData, setCompanyData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchCompany = async () => {
      try {
        setIsLoading(true);
        const data = await companyService.getCompany(id);

        if (isMounted) {
          setCompanyData(data);
          setError('');
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.response?.data?.message || 'Company profile is not available.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCompany();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    const name = companyData?.company?.companyName || companyData?.company?.name;
    setDocumentMeta({
      title: name ? `${name} Jobs and Company Profile | SkillMatch` : 'Company Profile | SkillMatch',
      description: companyData?.company?.companyDescription
        ? companyData.company.companyDescription.slice(0, 155)
        : 'View company details and active job openings on SkillMatch.'
    });
  }, [companyData?.company?.companyDescription, companyData?.company?.companyName, companyData?.company?.name]);

  const company = companyData?.company;
  const jobs = companyData?.jobs || [];
  const displayName = company?.companyName || company?.name || 'Company';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <main className="container-custom py-6 sm:py-8">
        <Link
          to="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to jobs
        </Link>

        {isLoading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <LoadingSpinner size="large" />
          </div>
        ) : error || !company ? (
          <EmptyState
            type="search"
            title="Company not available"
            description={error || 'This company profile could not be found.'}
          />
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-50">
                    {company.companyLogo ? (
                      <img
                        src={getOptimizedCloudinaryUrl(company.companyLogo, {
                          width: 128,
                          height: 128,
                          crop: 'fill'
                        })}
                        alt={`${displayName} logo`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-blue-700" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{displayName}</h1>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-600">
                      {company.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          {company.location}
                        </span>
                      )}
                      {company.companyWebsite && (
                        <a
                          href={company.companyWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-800"
                        >
                          <Globe className="h-4 w-4" aria-hidden="true" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-blue-50 px-4 py-3 text-blue-800">
                  <p className="text-2xl font-bold">{companyData.stats?.activeJobs || 0}</p>
                  <p className="text-sm font-semibold">open jobs</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="mb-3 text-xl font-bold text-gray-900">About</h2>
                <p className="whitespace-pre-line leading-7 text-gray-700">
                  {company.companyDescription || 'This employer has not added a company description yet.'}
                </p>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Open Jobs</h2>
                <span className="text-sm font-medium text-gray-600">{jobs.length} active</span>
              </div>

              {jobs.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job) => (
                    <Link
                      key={job._id}
                      to={`/jobs/${job._id}`}
                      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <h3 className="font-bold text-gray-900">{job.title}</h3>
                        <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden="true" />
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          {job.location}
                        </p>
                        <p className="flex items-center gap-2 capitalize">
                          <Briefcase className="h-4 w-4" aria-hidden="true" />
                          {job.jobType}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="briefcase"
                  title="No open jobs"
                  description="This company does not have active jobs right now."
                />
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default CompanyDetails;
