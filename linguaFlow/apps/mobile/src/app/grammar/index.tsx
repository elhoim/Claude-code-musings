import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

interface GrammarNode {
  id: string;
  name: string;
  mastery: 'mastered' | 'learning' | 'not-started';
}

interface GrammarLevel {
  level: string;
  nodes: GrammarNode[];
}

const GRAMMAR_LEVELS: GrammarLevel[] = [
  {
    level: 'A1',
    nodes: [
      { id: 'g1', name: 'Present Tense (Regular)', mastery: 'mastered' },
      { id: 'g2', name: 'Articles (el/la/los/las)', mastery: 'mastered' },
      { id: 'g3', name: 'Ser vs Estar', mastery: 'learning' },
      { id: 'g4', name: 'Gender & Number Agreement', mastery: 'learning' },
    ],
  },
  {
    level: 'A2',
    nodes: [
      { id: 'g5', name: 'Preterite Tense', mastery: 'learning' },
      { id: 'g6', name: 'Reflexive Verbs', mastery: 'not-started' },
      { id: 'g7', name: 'Object Pronouns', mastery: 'not-started' },
    ],
  },
  {
    level: 'B1',
    nodes: [
      { id: 'g8', name: 'Subjunctive (Present)', mastery: 'not-started' },
      { id: 'g9', name: 'Imperfect vs Preterite', mastery: 'not-started' },
      { id: 'g10', name: 'Conditional Tense', mastery: 'not-started' },
    ],
  },
  {
    level: 'B2',
    nodes: [
      { id: 'g11', name: 'Subjunctive (Past)', mastery: 'not-started' },
      { id: 'g12', name: 'Passive Voice', mastery: 'not-started' },
    ],
  },
];

function getMasteryColor(mastery: GrammarNode['mastery']) {
  switch (mastery) {
    case 'mastered':
      return '#10B981';
    case 'learning':
      return '#F59E0B';
    case 'not-started':
      return '#D1D5DB';
  }
}

function getMasteryLabel(mastery: GrammarNode['mastery']) {
  switch (mastery) {
    case 'mastered':
      return 'Mastered';
    case 'learning':
      return 'Learning';
    case 'not-started':
      return 'Not Started';
  }
}

export default function GrammarIndexScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Grammar Genome</Text>
      <Text style={styles.subtitle}>
        Master grammar concepts level by level
      </Text>

      {GRAMMAR_LEVELS.map((level) => (
        <View key={level.level} style={styles.levelSection}>
          <View style={styles.levelHeader}>
            <Text style={styles.levelBadge}>{level.level}</Text>
          </View>

          {level.nodes.map((node) => (
            <TouchableOpacity
              key={node.id}
              style={styles.nodeCard}
              onPress={() => router.push(`/grammar/${node.id}`)}
            >
              <View style={styles.nodeInfo}>
                <View
                  style={[styles.masteryDot, { backgroundColor: getMasteryColor(node.mastery) }]}
                />
                <Text style={styles.nodeName}>{node.name}</Text>
              </View>
              <Text style={[styles.masteryLabel, { color: getMasteryColor(node.mastery) }]}>
                {getMasteryLabel(node.mastery)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: -12,
  },
  levelSection: {
    gap: 8,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  levelBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  nodeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  nodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  masteryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  nodeName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  masteryLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
