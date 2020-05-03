import { h } from 'snabbdom'
import { VNode } from 'snabbdom/vnode';
import SwissController from '../ctrl';
import { player as renderPlayer, ratio2percent, bind, dataIcon, userName } from './util';
import { MaybeVNodes, Player } from '../interfaces';
import * as button from './button';
import * as pagination from '../pagination';

const scoreTagNames = ['score', 'streak', 'double'];

function scoreTag(s) {
  return h(scoreTagNames[(s[1] || 1) - 1], [Array.isArray(s) ? s[0] : s]);
}

function playerTr(ctrl: SwissController, player: Player) {
  const userId = player.user.id;
  return h('tr', {
    key: userId,
    class: {
      me: ctrl.data.me?.id == userId
    },
    hook: bind('click', _ => ctrl.showPlayerInfo(player), ctrl.redraw)
  }, [
    h('td.rank', player.withdraw ? h('i', {
      attrs: {
        'data-icon': 'Z',
        'title': ctrl.trans.noarg('pause')
      }
    }) : [player.rank]),
    h('td.player', renderPlayer(player, false, true)),
    // h('td.sheet', player.sheet.scores.map(scoreTag)),
    // h('td.total', [
    //   player.sheet.fire && !ctrl.data.isFinished ?
    //   h('strong.is-gold', { attrs: dataIcon('Q') }, player.sheet.total) :
    //   h('strong', player.sheet.total)
    // ])
  ]);
}

// function podiumUsername(p) {
//   return h('a.text.ulpt.user-link', {
//     attrs: { href: '/@/' + p.name }
//   }, userName(p));
// }

// function podiumStats(p, trans: Trans): VNode {
//   const noarg = trans.noarg, nb = p.nb;
//   return h('table.stats', [
//     p.performance ? h('tr', [h('th', noarg('performance')), h('td', p.performance)]) : null,
//     h('tr', [h('th', noarg('gamesPlayed')), h('td', nb.game)]),
//     ...(nb.game ? [
//       h('tr', [h('th', noarg('winRate')), h('td', ratio2percent(nb.win / nb.game))]),
//       h('tr', [h('th', noarg('berserkRate')), h('td', ratio2percent(nb.berserk / nb.game))])
//     ] : [])
//   ]);
// }

// function podiumPosition(p, pos, trans: Trans): VNode | undefined {
//   if (p) return h('div.' + pos, [
//     h('div.trophy'),
//     podiumUsername(p),
//     podiumStats(p, trans)
//   ]);
// }

// export function podium(ctrl: TournamentController) {
//   const p = ctrl.data.podium || [];
//   return h('div.tour__podium', [
//     podiumPosition(p[1], 'second', ctrl.trans),
//     podiumPosition(p[0], 'first', ctrl.trans),
//     podiumPosition(p[2], 'third', ctrl.trans)
//   ]);
// }

let lastBody: MaybeVNodes | undefined;

const preloadUserTips = (vn: VNode) => window.lichess.powertip.manualUserIn(vn.elm as HTMLElement);

export default function standing(ctrl: SwissController, pag, klass?: string): VNode {
  const tableBody = pag.currentPageResults ?
    pag.currentPageResults.map(res => playerTr(ctrl, res)) : lastBody;
  if (pag.currentPageResults) lastBody = tableBody;
  return h('table.slist.swiss__standing' + (klass ? '.' + klass : ''), {
    class: { loading: !pag.currentPageResults },
  }, [
    h('tbody', {
      hook: {
        insert: preloadUserTips,
        update(_, vnode) { preloadUserTips(vnode) }
      }
    }, tableBody)
  ]);
}