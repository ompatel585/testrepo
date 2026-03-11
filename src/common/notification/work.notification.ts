import { Work } from '../entities/work.entity';

export const workAdded = (work: Work) => ({
  metadata: { type: 'work', work: { id: work.id, userId: work.userId } },
  title: 'Work added for review',
  body: work.title + ' Work has been added',
});

export const workApproved = (work: Work) => ({
  metadata: { type: 'work', work: { id: work.id, userId: work.userId } },
  title: 'Work approved',
  body: work.title + ' Work has been approved',
});

export const workRejected = (work: Work) => ({
  metadata: { type: 'work', work: { id: work.id, userId: work.userId } },
  title: 'Work rejected',
  body: work.title + ' Work has been rejected',
});
