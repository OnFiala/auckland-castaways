"""Keep identical asset directories at their published URLs when updating the Site."""
import hashlib
import json
import posixpath
import re

from verify_web import CSS_URL, FILM_AUDIO_PACK


def asset_groups(manifest, whole_tree):
    groups = {}
    for file, digest in manifest['files'].items():
        _, separator, name = file.partition('/assets/')
        if not separator:
            continue
        first, slash, _ = name.partition('/')
        group = 'assets/' if whole_tree else 'assets/' + first + slash
        groups.setdefault(group, {})['assets/' + name] = (file, digest)
    return groups


def shared_groups(game, manifest, previous):
    # A script assembling the first folder name at runtime needs a common root
    # for *all* assets. Paths such as 'assets/walk/' + person can share by folder.
    root = manifest['directory']
    dynamic_root = re.compile(re.escape(root + 'assets/') + r"""[\w.-]*(?:\$\{|['"`]\s*\+)""")
    whole_tree = any(dynamic_root.search(file.read_text(encoding='utf-8'))
                     for file in (game / root).rglob('*.js') if not file.match(FILM_AUDIO_PACK))
    current = asset_groups(manifest, whole_tree)
    old = asset_groups(previous, whole_tree)
    shared = {}
    for group, items in current.items():
        before = old.get(group, {})
        if items.keys() != before.keys() or any(before[name][1] != data[1] for name, data in items.items()):
            continue
        roots = {file.removesuffix(name) for name, (file, _) in before.items()}
        if len(roots) == 1:
            shared[group] = roots.pop() + group
    return shared


def stage_update(game, staged, manifest, previous):
    """Write the new release alongside the retained trees, with a verifiable pin for each file."""
    shared = shared_groups(game, manifest, previous)
    # The hosted bytes depend on both the portable game's contents and which
    # identical groups are already published. Give this layout its own identity.
    build = hashlib.sha256(json.dumps(
        ['shared-asset-groups-v1', manifest['build'], shared], sort_keys=True
    ).encode()).hexdigest()
    root = manifest['directory']
    public_root = f"editions/{manifest['release']}-{build[:20]}/"
    new_manifest = dict(release=manifest['release'], build=build, directory=public_root,
                        source_build=manifest['build'], shared=shared, files={})
    alternatives = '|'.join(re.escape(group) + ('' if group.endswith('/') else r'(?![\w./-])')
                            for group in sorted(shared, key=len, reverse=True))
    address = re.compile(re.escape(root) + (f'({alternatives})?' if alternatives else '()'))

    def repin(text):
        return address.sub(lambda match: shared.get(match[1], public_root), text)

    for file, digest in manifest['files'].items():
        if file == 'index.html':
            continue
        target = repin(file)
        if not target.startswith(public_root):
            # This group has the same members and bytes in both editions.
            new_manifest['files'][target] = digest
            continue
        source, dest = game / file, staged / target
        dest.parent.mkdir(parents=True, exist_ok=True)
        payload = source.read_bytes()
        if source.suffix == '.js' and not source.match(FILM_AUDIO_PACK):
            payload = repin(payload.decode('utf-8')).encode('utf-8')
        elif source.suffix == '.css':
            def css_url(match):
                url = match[2].strip()
                if url.startswith(('data:', '#')):
                    return match[0]
                old = posixpath.normpath(posixpath.join(posixpath.dirname(file), url))
                new = posixpath.relpath(repin(old), posixpath.dirname(target))
                return match[0].replace(url, new, 1)
            payload = CSS_URL.sub(css_url, payload.decode('utf-8')).encode('utf-8')
        if dest.exists() and dest.read_bytes() != payload:
            raise ValueError(f'Hosted edition would overwrite an immutable URL: {target}')
        if not dest.exists():
            dest.write_bytes(payload)
        new_manifest['files'][target] = hashlib.sha256(payload).hexdigest()
    entry = repin((game / 'index.html').read_text(encoding='utf-8'))
    entry = entry.replace(f'name="game-build" content="{manifest["build"][:20]}"',
                          f'name="game-build" content="{build[:20]}"', 1)
    return entry, new_manifest
