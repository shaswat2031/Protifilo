import re

with open('src/app/page.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Hero name and title
content = content.replace(
    '<h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight" id="hero-headline">Hello, I am Jahnvi</h1>',
    '<h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight" id="hero-headline">{profile?.name ? `Hello, I am ${profile.name}` : "Hello..."}</h1>'
)
content = content.replace(
    '<p className="font-headline-md text-headline-md italic text-primary reveal-type">Rarefied Researcher, Starling Student &amp; Wending Writer</p>',
    '<p className="font-headline-md text-headline-md italic text-primary reveal-type">{profile?.title || "Researcher"}</p>'
)
content = content.replace(
    '<p className="font-body-lg text-body-lg max-w-xl text-on-surface-variant">Exploring Political Ecology, Green Governance &amp; Sustainable Development • \'Sarva Saha\'</p>',
    '<p className="font-body-lg text-body-lg max-w-xl text-on-surface-variant">{profile?.subtitle || "Exploring..."}</p>'
)

# 2. Update Image
content = re.sub(
    r'<img alt="Artistic representation of Jahnvi" className="w-full h-full object-cover scale-110" id="hero-image" src="[^"]+"/>',
    r'<img alt="Profile" className="w-full h-full object-cover scale-110" id="hero-image" src={profile?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAcjadWxcryruVsYmef2JTl_S4CBJ7g6wAFnfgUfm8L9A1YLS0Gj8I6GQxqrVZkBLozbkMXD7rjAuaBrxuVqY0uORltD9govAOtq_8YeNhd5Eh3P9hdZhnVAQiV2EDVVyka5i75ua2daSDPBOnj130yX4TdnOd1tvSMzz6Q3dNnob8n09Oyv0TjldoD7ZZU7D-dzNubsdp5r03RJQOjfvDKZ2usTu2BiAjD4C-PhmruTY-G6nKr7Shuho3LlWSVNcuqeHZG6W10bgI"} />',
    content
)

# 3. Update Research Statement Domain Cards
# We'll just replace the whole grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 div with a mapped version
domains_regex = r'<div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">.*?</div>\s*</div>\s*</div>\s*</div>\s*</section>'
replacement = """<div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
{researchInterests.map((interest, idx) => (
<div key={interest._id || idx} className={`paper-card p-10 rounded-[2.5rem] hover:-translate-y-2 transition-all duration-300 group ${idx === 1 ? 'border-primary/20' : ''}`}>
<span className="material-symbols-outlined text-primary text-5xl mb-6 block group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
{idx === 0 ? 'eco' : idx === 1 ? 'gavel' : 'cycle'}
</span>
<h3 className="font-headline-md text-[22px] text-on-surface mb-4">{interest.title}</h3>
<p className="font-body-md text-on-surface-variant">{interest.description}</p>
</div>
))}
</div>
</div>
</div>
</div>
</section>"""
content = re.sub(domains_regex, replacement, content, flags=re.DOTALL)


with open('src/app/page.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Mapped basic dynamic data.")
