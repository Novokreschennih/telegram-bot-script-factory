
import React from 'react';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-700/50 rounded-lg animate-pulse ${className}`} />
);

const GeneratedAssetsSkeleton: React.FC = () => {
    return (
        <div className="space-y-12 animate-fadeIn">
            {/* Bot Profile Skeleton */}
            <section className="bg-gray-800/50 rounded-2xl p-6 md:p-8">
                <SkeletonBlock className="h-8 w-1/3 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    <div className="md:col-span-3 space-y-6">
                        <div>
                            <SkeletonBlock className="h-5 w-1/4 mb-2" />
                            <SkeletonBlock className="h-4 w-full" />
                        </div>
                        <div>
                            <SkeletonBlock className="h-5 w-1/2 mb-2" />
                            <SkeletonBlock className="h-4 w-4/5 mt-2" />
                            <SkeletonBlock className="h-4 w-3/4 mt-2" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <div className="bg-gray-900/50 rounded-lg p-4 flex flex-col h-full">
                            <SkeletonBlock className="h-5 w-3/4 mb-2" />
                            <SkeletonBlock className="h-4 w-full flex-grow mb-4" />
                            <SkeletonBlock className="h-10 w-full mt-auto" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Script Preview Skeleton */}
            <section className="bg-gray-800/50 rounded-2xl p-6 md:p-8">
                <div className="text-center">
                    <SkeletonBlock className="h-8 w-1/2 mx-auto mb-2" />
                    <SkeletonBlock className="h-4 w-3/4 mx-auto mb-6" />
                </div>
                <div className="bg-gray-900/70 rounded-lg p-4 space-y-4 h-[400px]">
                    <div className="flex flex-col items-start">
                        <SkeletonBlock className="rounded-lg rounded-tl-none p-3 h-16 w-3/4" />
                    </div>
                    <div className="flex flex-col items-start">
                        <SkeletonBlock className="rounded-lg rounded-tl-none p-3 h-12 w-1/2" />
                         <div className="mt-2 flex flex-wrap gap-2">
                            <SkeletonBlock className="h-8 w-24 rounded-full" />
                            <SkeletonBlock className="h-8 w-32 rounded-full" />
                         </div>
                    </div>
                    <div className="flex flex-col items-start">
                        <SkeletonBlock className="rounded-lg rounded-tl-none p-3 h-20 w-5/6" />
                    </div>
                </div>
            </section>

            {/* Visuals Skeleton */}
            <section className="bg-gray-800/50 rounded-2xl p-6 md:p-8">
                <SkeletonBlock className="h-8 w-1/2 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {[...Array(3)].map((_, i) => (
                         <div key={i} className="bg-gray-900/50 rounded-lg p-4 flex flex-col h-48">
                            <SkeletonBlock className="h-5 w-3/4 mb-2" />
                            <SkeletonBlock className="h-4 w-full flex-grow mb-4" />
                            <SkeletonBlock className="h-10 w-full mt-auto" />
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default GeneratedAssetsSkeleton;