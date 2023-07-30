import { PageSeo } from 'components/SEO'
import { FriendCard } from '~/components/friends/FriendCard'
import { friendsData } from '~/data/friendsData'
import { siteMetadata } from '~/data/siteMetadata'

export default function Friends() {
  let friends = friendsData.filter(({ type }) => type === 'friend')
  let techStars = friendsData.filter(({ type }) => type === 'techStar')
  let description = 'My friends and the tech bloggers I recommend'

  return (
    <>
      <PageSeo title={`Projects - ${siteMetadata.author}`} description={description} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-8 space-y-2 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Friends
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="container py-12">
          <h3 className="mb-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
            My Friends
          </h3>
          <div className="flex flex-wrap -m-4">
            {friends.map((friend) => (
              <FriendCard key={friend.name} friend={friend} />
            ))}
          </div>
        </div>
        {techStars.length > 0 && (
          <div className="container py-12">
            <h3 className="mb-4 text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100">
              Technical bloggers
            </h3>
            <div className="flex flex-wrap -m-4">
              {techStars.map((friend) => (
                <FriendCard key={friend.name} friend={friend} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}