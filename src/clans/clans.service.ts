import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clan } from './clan.entity';
import {
  ClanApplication,
  ClanApplicationStatus,
} from './clan-application.entity';
import { ClanMember } from './clan-member.entity';

@Injectable()
export class ClansService {
  constructor(
    @InjectRepository(Clan)
    private readonly clanRepository: Repository<Clan>,

    @InjectRepository(ClanApplication)
    private readonly applicationRepository: Repository<ClanApplication>,

    @InjectRepository(ClanMember)
    private readonly memberRepository: Repository<ClanMember>,
  ) {}

  async createClan(data: {
    name: string;
    description: string;
    requirements?: string;
    leaderDiscordId: string;
    minecraftUsername: string;
    maxMembers?: number;
  }): Promise<Clan> {
    const existingMembership = await this.memberRepository.findOne({
      where: {
        discordId: data.leaderDiscordId,
      },
    });

    if (existingMembership) {
      throw new Error(
        'Ya perteneces a un clan. No puedes crear otro clan mientras pertenezcas a uno.',
      );
    }

    const clan = this.clanRepository.create({
      name: data.name,
      description: data.description,
      requirements: data.requirements ?? null,
      leaderDiscordId: data.leaderDiscordId,
      maxMembers: data.maxMembers ?? 20,
      memberCount: 1,
      forumThreadId: null,
    });

    const savedClan = await this.clanRepository.save(clan);

    const leader = this.memberRepository.create({
      clanId: savedClan.id,
      discordId: data.leaderDiscordId,
      minecraftUsername: data.minecraftUsername,
      role: 'leader',
    });

    await this.memberRepository.save(leader);

    return savedClan;
  }

  async getClanById(id: number): Promise<Clan> {
    const clan = await this.clanRepository.findOne({
      where: { id },
    });

    if (!clan) {
      throw new NotFoundException(`Clan ${id} no encontrado.`);
    }

    return clan;
  }

  async getClanByThreadId(threadId: string): Promise<Clan | null> {
    return this.clanRepository.findOne({
      where: {
        forumThreadId: threadId,
      },
    });
  }

  async getAllClans(): Promise<Clan[]> {
    return this.clanRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getClanByMember(
    discordId: string,
  ): Promise<Clan | null> {
    const member = await this.memberRepository.findOne({
      where: {
        discordId,
      },
    });

    if (!member) {
      return null;
    }

    return this.getClanById(member.clanId);
  }

  async isMemberOfAnyClan(
    discordId: string,
  ): Promise<boolean> {
    const member = await this.memberRepository.findOne({
      where: {
        discordId,
      },
    });

    return !!member;
  }

  async getClanMember(
    discordId: string,
  ): Promise<ClanMember | null> {
    return this.memberRepository.findOne({
      where: {
        discordId,
      },
    });
  }

  async removeMember(
  leaderDiscordId: string,
  targetDiscordId: string,
): Promise<Clan> {
  const leaderMember = await this.memberRepository.findOne({
    where: {
      discordId: leaderDiscordId,
    },
  });

  if (!leaderMember) {
    throw new Error('No perteneces a ningún clan.');
  }

  if (leaderMember.role !== 'leader') {
    throw new Error(
      'Solo el líder del clan puede expulsar miembros.',
    );
  }

  if (leaderDiscordId === targetDiscordId) {
    throw new Error(
      'No puedes expulsarte a ti mismo del clan.',
    );
  }

  const targetMember = await this.memberRepository.findOne({
    where: {
      discordId: targetDiscordId,
    },
  });

  if (!targetMember) {
    throw new Error(
      'El usuario indicado no pertenece a ningún clan.',
    );
  }

  if (targetMember.clanId !== leaderMember.clanId) {
    throw new Error(
      'Ese usuario no pertenece a tu clan.',
    );
  }

  const clan = await this.getClanById(
    leaderMember.clanId,
  );

  await this.memberRepository.remove(targetMember);

  clan.memberCount = Math.max(0, clan.memberCount - 1);

  await this.clanRepository.save(clan);

  return clan;
}

  async setForumThreadId(
    clanId: number,
    threadId: string,
  ): Promise<Clan> {
    const clan = await this.getClanById(clanId);

    clan.forumThreadId = threadId;

    return this.clanRepository.save(clan);
  }

  async canApply(
    clanId: number,
    applicantDiscordId: string,
  ): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const clan = await this.getClanById(clanId);

    /*
     * Un usuario solamente puede pertenecer
     * a un clan.
     */
    const currentMembership =
      await this.memberRepository.findOne({
        where: {
          discordId: applicantDiscordId,
        },
      });

    if (currentMembership) {
      return {
        allowed: false,
        reason:
          'Ya perteneces a un clan. Debes salir de tu clan actual antes de poder unirte a otro.',
      };
    }

    if (clan.memberCount >= clan.maxMembers) {
      return {
        allowed: false,
        reason:
          'Este clan ya alcanzó su límite de miembros.',
      };
    }

    const existingApplication =
      await this.applicationRepository.findOne({
        where: {
          clanId,
          applicantDiscordId,
          status: 'pending',
        },
      });

    if (existingApplication) {
      return {
        allowed: false,
        reason:
          'Ya tienes una postulación pendiente para este clan.',
      };
    }

    return {
      allowed: true,
    };
  }

  async createApplication(data: {
    clanId: number;
    applicantDiscordId: string;
    minecraftUsername: string;
    reason: string;
  }): Promise<ClanApplication> {
    const check = await this.canApply(
      data.clanId,
      data.applicantDiscordId,
    );

    if (!check.allowed) {
      throw new Error(check.reason);
    }

    const application =
      this.applicationRepository.create({
        clanId: data.clanId,
        applicantDiscordId:
          data.applicantDiscordId,
        minecraftUsername:
          data.minecraftUsername,
        reason: data.reason,
        status: 'pending',
        processedAt: null,
      });

    return this.applicationRepository.save(
      application,
    );
  }

  async leaveClan(discordId: string): Promise<Clan> {
  const member = await this.memberRepository.findOne({
    where: {
      discordId,
    },
  });

  if (!member) {
    throw new Error(
      'No perteneces a ningún clan.',
    );
  }

  if (member.role === 'leader') {
    throw new Error(
      'El líder no puede abandonar el clan. Primero debes transferir el liderazgo a otro miembro.',
    );
  }

  const clan = await this.getClanById(member.clanId);

  await this.memberRepository.remove(member);

  clan.memberCount = Math.max(
    0,
    clan.memberCount - 1,
  );

  await this.clanRepository.save(clan);

  return clan;
}
  
  async disbandClan(discordId: string): Promise<Clan> {
  const member = await this.memberRepository.findOne({
    where: {
      discordId,
    },
  });

  if (!member) {
    throw new Error(
      'No perteneces a ningún clan.',
    );
  }

  if (member.role !== 'leader') {
    throw new Error(
      'Solo el líder puede disolver el clan.',
    );
  }

  const clan = await this.getClanById(member.clanId);

  await this.applicationRepository.delete({
    clanId: clan.id,
  });

  await this.memberRepository.delete({
    clanId: clan.id,
  });

  await this.clanRepository.remove(clan);

  return clan;
}

  async getApplicationById(
    id: number,
  ): Promise<ClanApplication> {
    const application =
      await this.applicationRepository.findOne({
        where: { id },
      });

    if (!application) {
      throw new NotFoundException(
        `Postulación ${id} no encontrada.`,
      );
    }

    return application;
  }

  async getPendingApplicationForClan(
    clanId: number,
    applicantDiscordId: string,
  ): Promise<ClanApplication | null> {
    return this.applicationRepository.findOne({
      where: {
        clanId,
        applicantDiscordId,
        status: 'pending',
      },
    });
  }

  async processApplication(
  applicationId: number,
  leaderDiscordId: string,
  status: Extract<
    ClanApplicationStatus,
    'accepted' | 'rejected'
  >,
): Promise<{
  application: ClanApplication;
  clan: Clan;
}> {
  const application =
    await this.getApplicationById(applicationId);

  const clan =
    await this.getClanById(application.clanId);

  if (
    clan.leaderDiscordId !== leaderDiscordId
  ) {
    throw new Error(
      'No tienes permiso para procesar esta postulación.',
    );
  }

  if (application.status !== 'pending') {
    throw new Error(
      'Esta postulación ya fue procesada anteriormente.',
    );
  }

  if (
    status === 'accepted' &&
    clan.memberCount >= clan.maxMembers
  ) {
    throw new Error(
      'El clan ya alcanzó el límite máximo de miembros.',
    );
  }

  /*
   * Si se acepta, comprobamos nuevamente que
   * el usuario no haya entrado a otro clan mientras
   * la postulación estaba pendiente.
   */
  if (status === 'accepted') {
    const existingMembership =
      await this.memberRepository.findOne({
        where: {
          discordId:
            application.applicantDiscordId,
        },
      });

    if (existingMembership) {
      throw new Error(
        'Este usuario ya pertenece a un clan.',
      );
    }
  }

  application.status = status;
  application.processedAt = new Date();

  await this.applicationRepository.save(
    application,
  );

  if (status === 'accepted') {
    const member =
      this.memberRepository.create({
        clanId: clan.id,
        discordId:
          application.applicantDiscordId,
        minecraftUsername:
          application.minecraftUsername,
        role: 'member',
      });

    await this.memberRepository.save(member);

    clan.memberCount += 1;

    await this.clanRepository.save(clan);
  }

  return {
    application,
    clan,
  };
}
}
