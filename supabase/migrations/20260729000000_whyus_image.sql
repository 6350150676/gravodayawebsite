-- The seeded "Why choose us" photo was a stock Swiss lakeside village, which
-- reads as anywhere-but-Haridwar. Point it at the local Har Ki Pauri shot in
-- /public instead. Only touches the row if it still holds the seeded value, so
-- an image the admin picked from /admin/content is left alone.
update site_settings
   set value = '/har-ki-pauri-haridwar.jpg'
 where key = 'whyus_image_url'
   and value like 'https://images.unsplash.com/photo-1750301668797-f21fa5973d62%';
